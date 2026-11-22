"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, Clock, PackageCheck, Wallet, ImagePlus, Download } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useGuard } from "./Auth";
import LoanCard from "./LoanCard";
import ItemImg from "./ItemImg";
import { Empty, H2, Head, Tabs, Tile } from "./Bits";
import Charts from "./Charts";
import { useToast } from "./Toast";
import { bP, bR, bS, sm, CARD, IN, rupiah, telatHari, dendaHitung, unduhCSV } from "../lib/ui";
const blank = { nama: "", kategori: "", stok: 1, denda_per_hari: 5000 };
export default function Admin() {
  const toast = useToast(), { profile } = useGuard("admin"), [L, setL] = useState(null), [items, setItems] = useState([]), [tab, setTab] = useState("ringkasan"), [f, setF] = useState(blank), [file, setFile] = useState(null);
  const load = async () => {
    const a = await supabase.from("loans").select("*, items(id,nama,foto_url,kategori,denda_per_hari), profiles(nama,nim)").order("created_at", { ascending: false });
    const b = await supabase.from("items").select("*").eq("aktif", true).order("nama");
    setL(a.data || []); setItems(b.data || []);
  };
  useEffect(() => { if (profile?.role === "admin") load(); }, [profile]);
  async function act(a, l) {
    let r;
    if (a === "setuju") r = await supabase.from("loans").update({ status: "disetujui" }).eq("id", l.id);
    if (a === "tolak") { const c = prompt("Alasan penolakan (opsional):"); if (c === null) return; r = await supabase.from("loans").update({ status: "ditolak", catatan_admin: c }).eq("id", l.id); }
    if (a === "selesai") {
      const k = prompt("Kondisi barang saat kembali (Baik / Rusak ringan / Rusak berat):", "Baik"); if (k === null) return;
      const d = dendaHitung(l); if (d > 0) toast("Terlambat " + telatHari(l) + " hari. Denda: " + rupiah(d), "err");
      r = await supabase.from("loans").update({ status: "selesai", kondisi_kembali: k, dikembalikan_pada: new Date().toISOString(), denda: d, denda_lunas: d === 0 }).eq("id", l.id);
    }
    if (a === "lunas") r = await supabase.from("loans").update({ denda_lunas: true }).eq("id", l.id);
    if (r?.error) toast(r.error.message, "err"); else toast("Berhasil diperbarui.");
    load();
  }
  async function upload(id, fl) {
    const path = id + "-" + Date.now() + "." + fl.name.split(".").pop();
    const u = await supabase.storage.from("barang").upload(path, fl); if (u.error) return toast("Gagal unggah foto: " + u.error.message, "err");
    await supabase.from("items").update({ foto_url: supabase.storage.from("barang").getPublicUrl(path).data.publicUrl }).eq("id", id);
  }
  async function add(e) {
    e.preventDefault();
    const { data, error } = await supabase.from("items").insert({ ...f, stok: +f.stok, denda_per_hari: +f.denda_per_hari }).select().single(); if (error) return toast(error.message, "err");
    if (file) await upload(data.id, file); setF(blank); setFile(null); e.target.reset(); load();
  }
  const edit = async (i, k, label) => { const v = prompt(label + " untuk " + i.nama, i[k]); if (v === null || isNaN(+v) || +v < 0) return; await supabase.from("items").update({ [k]: +v }).eq("id", i.id); load(); };
  const del = async (i) => { if (confirm("Nonaktifkan " + i.nama + " dari daftar?")) { await supabase.from("items").update({ aktif: false }).eq("id", i.id); load(); } };
  if (!profile || L === null) return <p className="p-10 text-center text-slate-500">Memuat...</p>;
  const n = (s) => L.filter((x) => s.includes(x.status)), set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const dipinjam = n(["disetujui"]), telat = dipinjam.filter((x) => telatHari(x) > 0), unpaid = L.filter((x) => x.status === "selesai" && x.denda > 0 && !x.denda_lunas);
  const tunggak = telat.reduce((s, x) => s + dendaHitung(x), 0) + unpaid.reduce((s, x) => s + x.denda, 0);
  const top = Object.entries(L.filter((x) => x.status !== "ditolak").reduce((o, x) => { const k = x.items?.nama; o[k] = (o[k] || 0) + x.qty; return o; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const list = (a, m) => a.length ? a.map((l) => <LoanCard key={l.id} l={l} admin onAct={act} />) : <Empty>{m}</Empty>;
  return (<main className="mx-auto max-w-6xl px-4 py-10"><Head t="Panel Admin Prodi" p="Kelola pengajuan, pengembalian, denda, dan stok barang sekretariat." />
    <Tabs v={tab} set={setTab} tabs={[["ringkasan", "Ringkasan"], ["pengajuan", "Pengajuan", n(["menunggu"]).length], ["dipinjam", "Sedang Dipinjam", telat.length], ["barang", "Kelola Barang"], ["riwayat", "Riwayat dan Denda"]]} />
    {tab === "ringkasan" && <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Tile i={Clock} n={n(["menunggu"]).length} l="Menunggu persetujuan" c="bg-amber-100 text-amber-900" /><Tile i={PackageCheck} n={dipinjam.length} l="Sedang dipinjam" c="bg-sky-100 text-sky-900" /><Tile i={AlertTriangle} n={telat.length} l="Terlambat kembali" c={telat.length ? "bg-rose-100 text-rose-900" : "bg-emerald-100 text-emerald-900"} /><Tile i={Wallet} n={rupiah(tunggak)} l="Denda belum lunas" c="bg-violet-100 text-violet-900" /></div>
      <Charts L={L} />
      {telat.length > 0 && <><H2>Terlambat dikembalikan</H2>{telat.map((l) => <LoanCard key={l.id} l={l} admin onAct={act} />)}</>}
      <H2>Perlu persetujuan</H2>{list(n(["menunggu"]), "Tidak ada pengajuan baru.")}
      {top.length > 0 && <><H2>Barang paling sering dipinjam</H2><div className={CARD + " space-y-3"}>{top.map(([k, v]) => <div key={k}><div className="mb-1 flex justify-between text-sm"><span className="font-semibold">{k}</span><span className="text-slate-500">{v} unit</span></div><div className="h-2.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: (v / top[0][1]) * 100 + "%" }} /></div></div>)}</div></>}</>}
    {tab === "pengajuan" && list(n(["menunggu"]), "Semua pengajuan sudah diproses.")}
    {tab === "dipinjam" && <><p className="mb-4 text-sm text-slate-500">Konfirmasi pengembalian langsung dari sini saat barang diterima. Denda dihitung otomatis jika terlambat.</p>{list(dipinjam, "Tidak ada barang yang sedang dipinjam.")}</>}
    {tab === "riwayat" && <><div className="mb-4 flex justify-end"><button onClick={() => unduhCSV(L)} className={bS}><Download size={16} />Unduh CSV</button></div>{list(n(["selesai", "ditolak"]), "Belum ada riwayat.")}</>}
    {tab === "barang" && <>
      <form onSubmit={add} className={CARD + " mb-6 grid gap-3 sm:grid-cols-6"}>
        <input required placeholder="Nama barang" className={IN + " sm:col-span-2"} value={f.nama} onChange={set("nama")} /><input required placeholder="Kategori" className={IN} value={f.kategori} onChange={set("kategori")} />
        <input type="number" min="0" title="Stok" placeholder="Stok" className={IN} value={f.stok} onChange={set("stok")} /><input type="number" min="0" title="Denda per hari" placeholder="Denda/hari" className={IN} value={f.denda_per_hari} onChange={set("denda_per_hari")} />
        <button className={bP}>Tambah</button>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 sm:col-span-6"><ImagePlus size={18} />Foto barang (opsional): <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="text-sm" /></label></form>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((i) => <div key={i.id} className={CARD + " flex flex-col !p-3"}>
        <ItemImg item={i} className="h-36 rounded-xl" />
        <div className="flex-1 p-2"><h3 className="text-lg font-semibold leading-snug">{i.nama}</h3><p className="text-sm text-slate-500">{i.kategori}</p>
          <div className="mt-2 flex flex-wrap gap-2"><span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">Stok {i.stok}</span><span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">Denda {rupiah(i.denda_per_hari)}/hari</span></div></div>
        <div className="grid grid-cols-2 gap-2 p-2 pt-0"><button onClick={() => edit(i, "stok", "Stok baru")} className={bS + sm}>Ubah stok</button><button onClick={() => edit(i, "denda_per_hari", "Denda per hari (Rp)")} className={bS + sm}>Ubah denda</button>
          <label className={bS + sm + " cursor-pointer text-center"}>Ganti foto<input type="file" accept="image/*" hidden onChange={async (e) => { if (e.target.files[0]) { await upload(i.id, e.target.files[0]); load(); } }} /></label><button onClick={() => del(i)} className={bR + sm}>Hapus</button></div></div>)}</div></>}
  </main>);
}
