-- Jalankan seluruh file ini di Supabase: SQL Editor > New query > Run

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  nama text not null, nim text,
  role text not null default 'mahasiswa' check (role in ('mahasiswa','admin')),
  created_at timestamptz default now());

create table items (
  id bigint generated always as identity primary key,
  nama text not null, kategori text not null,
  stok int not null check (stok >= 0),
  kondisi text not null default 'Baik',
  lokasi text default 'Sekretariat Prodi',
  emoji text default '📦', aktif boolean default true);

create table loans (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  item_id bigint not null references items(id) on delete cascade,
  qty int not null check (qty > 0),
  tgl_pinjam date not null, tgl_kembali date not null,
  tujuan text not null,
  status text not null default 'menunggu' check (status in ('menunggu','disetujui','ditolak','kembali','selesai')),
  catatan_admin text, kondisi_kembali text,
  created_at timestamptz default now());

-- Profil otomatis saat daftar
create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles(id, nama, nim) values (new.id,
    coalesce(new.raw_user_meta_data->>'nama', split_part(new.email,'@',1)), new.raw_user_meta_data->>'nim');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

create function is_admin() returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin') $$;

-- Stok tersedia untuk publik (tanpa membuka data peminjam)
create view item_stock as
  select i.*, coalesce((select sum(l.qty) from loans l where l.item_id = i.id and l.status in ('disetujui','kembali')),0)::int as dipinjam
  from items i where i.aktif;
grant select on item_stock to anon, authenticated;

-- Cegah persetujuan yang melebihi stok
create function check_stok() returns trigger language plpgsql as $$
declare tot int; used int;
begin
  if new.status = 'disetujui' and old.status = 'menunggu' then
    select stok into tot from items where id = new.item_id;
    select coalesce(sum(qty),0) into used from loans where item_id = new.item_id and status in ('disetujui','kembali') and id <> new.id;
    if used + new.qty > tot then raise exception 'Stok tidak mencukupi untuk menyetujui pengajuan ini'; end if;
  end if;
  return new;
end $$;
create trigger trg_check_stok before update on loans for each row execute function check_stok();

-- Keamanan (Row Level Security)
alter table profiles enable row level security;
alter table items enable row level security;
alter table loans enable row level security;
create policy "profil: lihat sendiri/admin" on profiles for select using (id = auth.uid() or is_admin());
create policy "profil: admin ubah" on profiles for update using (is_admin());
create policy "barang: semua boleh lihat" on items for select using (true);
create policy "barang: admin kelola" on items for all using (is_admin()) with check (is_admin());
create policy "pinjam: lihat sendiri/admin" on loans for select using (user_id = auth.uid() or is_admin());
create policy "pinjam: ajukan sendiri" on loans for insert with check (user_id = auth.uid() and status = 'menunggu');
create policy "pinjam: admin ubah" on loans for update using (is_admin());
create policy "pinjam: ajukan pengembalian" on loans for update using (user_id = auth.uid() and status = 'disetujui') with check (user_id = auth.uid() and status = 'kembali');
create policy "pinjam: batalkan" on loans for delete using ((user_id = auth.uid() and status = 'menunggu') or is_admin());

-- Data awal: barang sekretariat prodi
insert into items (nama, kategori, stok, kondisi, emoji) values
 ('Proyektor Portable','Elektronik',3,'Baik','📽️'),('Laptop Inventaris','Elektronik',5,'Baik','💻'),
 ('Kabel HDMI dan VGA','Aksesori',8,'Baik','🔌'),('Terminal Listrik (Roll)','Aksesori',6,'Baik','⚡'),
 ('Microphone Wireless','Audio',2,'Baik','🎙️'),('Speaker Portable','Audio',2,'Cukup','🔊'),
 ('Kamera DSLR','Multimedia',1,'Baik','📷'),('Tripod','Multimedia',2,'Baik','🎞️'),
 ('Laser Pointer / Clicker','Aksesori',4,'Baik','🔦'),('Papan Tulis Mini + Spidol','Perlengkapan',3,'Baik','📝');
