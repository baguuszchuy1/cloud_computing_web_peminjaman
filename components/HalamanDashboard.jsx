"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Clock, FileText, PackageCheck, Wallet } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useGuard } from "./Auth";
import LoanCard from "./LoanCard";
import ItemImg from "./ItemImg";
import { Empty, H2, Tabs, Tile } from "./Bits";
import { CARD, bP, fdt, rupiah, telatHari, dendaHitung, sisaTxt } from "../lib/ui";
export default function Dash() {
  const { user, profile } = useGuard("mahasiswa"), [L, setL] = useState(null), [items, setItems] = useState([]), [tab, setTab] = useState("status");
  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("loans").select("*, items(id,nama,foto_url,kategori,denda_per_hari)").eq("user_id", user.id).order("created_at", { ascending: false }); setL(data || []);
    const s = await supabase.from("item_stock").select("*").order("nama").limit(8); setItems(s.data || []);
  }, [user]);
  useEffect(() => { load(); }, [load]);
  async function act(a, l) { if (a === "batal" && confirm("Batalkan pengajuan ini?")) { await supabase.from("loans").delete().eq("id", l.id); load(); } }
  if (!profile || L === null) return <p className="p-10 text-center text-slate-500">Memuat...</p>;
  const aktif = L.filter((x) => x.status === "disetujui"), telat = aktif.filter((x) => telatHari(x) > 0);
  const denda = telat.reduce((s, x) => s + dendaHitung(x), 0) + L.filter((x) => x.status === "selesai" && x.denda > 0 && !x.denda_lunas).reduce((s, x) => s + x.denda, 0);
  const show = tab === "status" ? L.filter((x) => ["menunggu", "disetujui"].includes(x.status)) : L.filter((x) => ["selesai", "ditolak"].includes(x.status));
  return (<main className="mx-auto max-w-6xl px-4 py-10">
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 p-8 text-white shadow-xl shadow-blue-600/20"><span className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10" /><span className="absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/10" />
      <div className="relative"><p className="text-sm font-medium text-blue-100">Dashboard mahasiswa</p><h1 className="mt-1 text-3xl font-extrabold md:text-4xl">Halo, {profile.nama.split(" ")[0]}</h1><p className="mt-2 max-w-xl text-blue-50">{aktif.length ? "Kamu sedang meminjam " + aktif.length + " barang dari sekretariat prodi." : "Belum ada barang yang kamu pinjam. Butuh sesuatu untuk kegiatanmu?"}</p>
        <div className="mt-5 flex flex-wrap gap-3"><Link href="/ajukan" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 shadow-lg transition hover:-translate-y-0.5">Ajukan peminjaman <ArrowRight size={16} /></Link><Link href="/" className="rounded-xl border border-white/40 px-5 py-2.5 text-sm font-semibold hover:bg-white/10">Lihat katalog</Link></div></div></section>
    {denda > 0 && <div className="mt-5 flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800"><AlertTriangle className="flex-none" /><p className="text-sm"><b>Ada denda keterlambatan {rupiah(denda)}.</b> {telat.length > 0 ? "Segera kembalikan barang ke sekretariat prodi, denda bertambah setiap hari." : "Hubungi admin prodi untuk melunasinya."}</p></div>}
    <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Tile i={FileText} n={L.length} l="Total pengajuan" c="bg-blue-100 text-blue-900" /><Tile i={Clock} n={L.filter((x) => x.status === "menunggu").length} l="Menunggu persetujuan" c="bg-amber-100 text-amber-900" />
      <Tile i={PackageCheck} n={aktif.length} l="Sedang dipinjam" c="bg-sky-100 text-sky-900" /><Tile i={Wallet} n={rupiah(denda)} l="Denda belum lunas" c={denda ? "bg-rose-100 text-rose-900" : "bg-emerald-100 text-emerald-900"} /></div>
    {aktif.length > 0 && <><H2>Sedang dipinjam</H2><div className="grid gap-4 md:grid-cols-2">{aktif.map((l) => { const t = telatHari(l) > 0, p = Math.min(100, Math.max(0, ((Date.now() - new Date(l.mulai)) / (new Date(l.selesai) - new Date(l.mulai))) * 100));
      return <div key={l.id} className={CARD + " flex gap-4 !p-4 " + (t ? "!border-rose-300" : "")}><ItemImg item={{ ...l.items, id: l.item_id }} className="h-24 w-24 flex-none rounded-xl" />
        <div className="flex-1"><h3 className="font-semibold">{l.items?.nama} × {l.qty}</h3><p className="text-sm text-slate-500">Kembali: {fdt(l.selesai)}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className={"h-full rounded-full " + (t ? "bg-rose-500" : "bg-blue-600")} style={{ width: p + "%" }} /></div>
          <p className={"mt-1.5 text-sm font-semibold " + (t ? "text-rose-600" : "text-blue-700")}>{sisaTxt(l)}{t ? " • denda " + rupiah(dendaHitung(l)) : ""}</p></div></div>; })}</div></>}
    <H2>Pengajuan saya</H2><Tabs v={tab} set={setTab} tabs={[["status", "Status Peminjaman"], ["riwayat", "Riwayat"]]} />
    {show.length ? show.map((l) => <LoanCard key={l.id} l={l} onAct={act} />) : <Empty>Belum ada data di bagian ini.</Empty>}
    <H2>Pinjam lagi</H2><div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2">{items.map((i) => <Link key={i.id} href={"/ajukan?item=" + i.id} className={CARD + " w-44 flex-none !p-2.5 transition"}><ItemImg item={i} className="aspect-square rounded-lg" /><p className="mt-2 text-sm font-semibold leading-tight">{i.nama}</p><p className={"text-xs " + (i.stok - i.dipinjam > 0 ? "text-emerald-600" : "text-rose-600")}>{i.stok - i.dipinjam > 0 ? (i.stok - i.dipinjam) + " tersedia" : "Sedang habis"}</p></Link>)}</div>
  </main>);
}
