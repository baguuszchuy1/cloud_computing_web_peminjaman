-- Jalankan SETELAH schema.sql (SQL Editor > New query > Run). Aman dijalankan sekali pada database yang sudah ada.
alter table items add column if not exists foto_url text, add column if not exists denda_per_hari int not null default 0;
alter table loans add column if not exists mulai timestamptz, add column if not exists selesai timestamptz,
  add column if not exists dikembalikan_pada timestamptz, add column if not exists denda int not null default 0, add column if not exists denda_lunas boolean not null default false;
do $$ begin
  if exists (select 1 from information_schema.columns where table_name='loans' and column_name='tgl_pinjam') then
    update loans set mulai = (tgl_pinjam::timestamp + interval '8 hours') at time zone 'Asia/Jakarta',
                     selesai = (tgl_kembali::timestamp + interval '16 hours') at time zone 'Asia/Jakarta' where mulai is null;
    alter table loans drop column tgl_pinjam; alter table loans drop column tgl_kembali;
  end if; end $$;
alter table loans alter column mulai set not null, alter column selesai set not null;

-- Pengembalian langsung dikonfirmasi admin (status 'kembali' dihapus)
update loans set status='disetujui' where status='kembali';
alter table loans drop constraint if exists loans_status_check;
alter table loans add constraint loans_status_check check (status in ('menunggu','disetujui','ditolak','selesai'));
drop policy if exists "pinjam: ajukan pengembalian" on loans;

-- Denda per hari (Rupiah) per barang
update items set denda_per_hari = case nama
  when 'Proyektor Portable' then 25000 when 'Laptop Inventaris' then 30000 when 'Kamera DSLR' then 40000
  when 'Microphone Wireless' then 15000 when 'Speaker Portable' then 15000 when 'Tripod' then 10000 else 5000 end
  where denda_per_hari = 0;

-- Stok tersedia pada rentang waktu tertentu (barang yang telat tetap dianggap terpakai)
create or replace function stok_tersedia(p_item bigint, p_mulai timestamptz, p_selesai timestamptz, p_exclude bigint default 0)
returns int language sql security definer stable set search_path = public as $$
  select i.stok - coalesce((select sum(l.qty) from loans l where l.item_id = i.id and l.id <> p_exclude
    and l.status in ('menunggu','disetujui') and l.mulai < p_selesai
    and p_mulai < case when l.status = 'disetujui' then greatest(l.selesai, now()) else l.selesai end), 0)::int
  from items i where i.id = p_item $$;
grant execute on function stok_tersedia(bigint, timestamptz, timestamptz, bigint) to anon, authenticated;

drop trigger if exists trg_check_stok on loans; drop function if exists check_stok();
create or replace function cek_bentrok() returns trigger language plpgsql as $$
begin
  if new.selesai <= new.mulai then raise exception 'Waktu kembali harus setelah waktu pinjam'; end if;
  if tg_op = 'INSERT' or (new.status = 'disetujui' and old.status = 'menunggu') then
    if stok_tersedia(new.item_id, new.mulai, new.selesai, case when tg_op = 'UPDATE' then new.id else 0 end) < new.qty then
      raise exception 'Bentrok jadwal: stok barang tidak mencukupi pada waktu tersebut'; end if;
  end if;
  return new;
end $$;
drop trigger if exists trg_bentrok on loans;
create trigger trg_bentrok before insert or update on loans for each row execute function cek_bentrok();

drop view if exists item_stock;
create view item_stock as
  select i.*, coalesce((select sum(l.qty) from loans l where l.item_id = i.id and l.status = 'disetujui' and l.mulai <= now()), 0)::int as dipinjam
  from items i where i.aktif;
grant select on item_stock to anon, authenticated;

-- Penyimpanan foto barang
insert into storage.buckets (id, name, public) values ('barang', 'barang', true) on conflict do nothing;
create policy "foto barang: publik lihat" on storage.objects for select using (bucket_id = 'barang');
create policy "foto barang: admin unggah" on storage.objects for insert with check (bucket_id = 'barang' and is_admin());
create policy "foto barang: admin ubah" on storage.objects for update using (bucket_id = 'barang' and is_admin());
create policy "foto barang: admin hapus" on storage.objects for delete using (bucket_id = 'barang' and is_admin());
