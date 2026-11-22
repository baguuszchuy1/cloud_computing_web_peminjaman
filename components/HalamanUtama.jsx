"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, MapPin, LayoutGrid, List, X, ChevronDown, UserCheck, ClipboardCheck, RotateCcw, Wallet } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./Auth";
import ItemImg from "./ItemImg";
import { Count } from "./Bits";
import { bP, bS, sm, rupiah } from "../lib/ui";
const STEPS = [[Search, "Cari barang", "Telusuri katalog dan cek stok tanpa perlu login."], [UserCheck, "Masuk dan ajukan", "Pilih tanggal dan jam. Bentrok jadwal dicek otomatis."], [ClipboardCheck, "Tunggu persetujuan", "Admin prodi menyetujui dan statusnya bisa kamu pantau."], [RotateCcw, "Kembalikan", "Serahkan ke sekretariat, admin mengonfirmasi di sistem."]];
const FAQ = [["Apakah harus login untuk melihat barang?", "Tidak. Katalog dan stok bisa dilihat siapa saja. Login hanya diperlukan saat mengajukan peminjaman."], ["Berapa lama proses persetujuan?", "Admin prodi memproses pengajuan pada jam kerja. Statusnya selalu bisa dipantau di dashboard."], ["Bagaimana jika terlambat mengembalikan?", "Setiap barang punya tarif denda per hari. Denda dihitung otomatis dan dibulatkan ke atas per hari keterlambatan."], ["Bagaimana cara mengembalikan barang?", "Serahkan barang ke sekretariat prodi. Admin mengonfirmasi pengembalian dan kondisi barang langsung di sistem."]];
export default function Home() {
  const [items, setItems] = useState(null), [q, setQ] = useState(""), [cat, setCat] = useState("Semua"), [sort, setSort] = useState("nama"), [only, setOnly] = useState(false), [view, setView] = useState("grid"), [sel, setSel] = useState(null), [err, setErr] = useState(""), [faq, setFaq] = useState(0);
  const { user, profile } = useAuth(), r = useRouter(), isAdmin = profile?.role === "admin";
  useEffect(() => { supabase.from("item_stock").select("*").order("nama").then(({ data, error }) => { if (error) setErr(error.message); setItems(data || []); }); }, []);
  useEffect(() => { const k = (e) => e.key === "Escape" && setSel(null); addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, []);
  const av = (i) => i.stok - i.dipinjam, all = items || [], cats = ["Semua", ...new Set(all.map((i) => i.kategori))];
  const list = all.filter((i) => (cat === "Semua" || i.kategori === cat) && i.nama.toLowerCase().includes(q.toLowerCase()) && (!only || av(i) > 0)).sort((a, b) => sort === "tersedia" ? av(b) - av(a) : sort === "stok" ? b.stok - a.stok : a.nama.localeCompare(b.nama));
  const go = () => document.getElementById("katalog")?.scrollIntoView({ behavior: "smooth" });
  const pinjam = (i) => r.push(user ? "/ajukan?item=" + i.id : "/login?next=" + encodeURIComponent("/ajukan?item=" + i.id));
  const card = (i) => { const a = av(i), pct = i.stok ? Math.round((a / i.stok) * 100) : 0, L = view === "list"; return (
    <div key={i.id} className={"group animate-up overflow-hidden rounded-2xl border border-white bg-white shadow-[0_8px_30px_rgba(30,64,175,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(30,64,175,0.15)] " + (L ? "flex flex-col sm:flex-row" : "flex flex-col")}>
      <div className={"relative overflow-hidden " + (L ? "sm:w-60" : "")}><ItemImg item={i} className={(L ? "h-40 sm:h-full" : "h-44") + " transition duration-500 group-hover:scale-105"} />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 backdrop-blur">{i.kategori}</span>
        <span className={"absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold text-white " + (a > 0 ? "bg-emerald-500" : "bg-rose-500")}>{a > 0 ? "Tersedia" : "Habis"}</span></div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div><h3 className="text-lg font-bold leading-snug">{i.nama}</h3><p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin size={14} />{i.lokasi}</p></div>
        <div><div className="mb-1.5 flex justify-between text-xs"><span className="font-semibold text-slate-700">{a} dari {i.stok} unit tersedia</span><span className="text-slate-400">{pct}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={"h-full rounded-full transition-all duration-700 " + (a > 0 ? "bg-gradient-to-r from-blue-500 to-cyan-400" : "bg-rose-400")} style={{ width: pct + "%" }} /></div></div>
        <p className="flex items-center gap-1.5 text-xs text-slate-500"><Wallet size={13} />Denda terlambat {rupiah(i.denda_per_hari)} per hari</p>
        <div className="mt-auto flex gap-2 pt-1"><button onClick={() => setSel(i)} className={bS + sm}>Detail</button>{!isAdmin && <button disabled={a <= 0} onClick={() => pinjam(i)} className={bP + sm}>Pinjam</button>}</div></div></div>); };
  return (<>
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-blue-600 to-cyan-500 text-white">
      <span className="absolute -left-24 top-10 h-72 w-72 animate-float rounded-full bg-white/10 blur-2xl" /><span className="absolute -right-16 -top-10 h-80 w-80 animate-float rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="relative mx-auto max-w-4xl px-4 pb-24 pt-20 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur"><Sparkles size={15} />Sekretariat Program Studi</span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-[1.1] md:text-6xl">Pinjam barang prodi, tanpa antre dan tanpa bentrok.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-blue-50">Cek stok proyektor, laptop, mic, dan perlengkapan lain secara langsung. Masuk hanya saat kamu siap mengajukan.</p>
        <div className="mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-2xl bg-white p-2 shadow-2xl shadow-blue-950/30"><Search className="ml-3 flex-none text-slate-400" size={20} />
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()} placeholder="Cari proyektor, laptop, mic..." className="min-w-0 flex-1 bg-transparent px-2 py-3 text-slate-900 outline-none placeholder:text-slate-400" /><button onClick={go} className={bP}>Cari</button></div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">{cats.slice(1, 6).map((c) => <button key={c} onClick={() => { setCat(c); go(); }} className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur transition hover:bg-white/25">{c}</button>)}</div>
        <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-3">{[[all.length, "jenis barang"], [all.reduce((a, i) => a + av(i), 0), "unit tersedia"], [all.reduce((a, i) => a + i.dipinjam, 0), "sedang dipinjam"]].map(([n, l]) => <div key={l} className="rounded-2xl border border-white/20 bg-white/10 py-4 backdrop-blur"><div className="text-3xl font-extrabold"><Count n={n} /></div><div className="text-xs text-blue-100">{l}</div></div>)}</div></div>
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="absolute bottom-0 block h-12 w-full text-slate-50"><path fill="currentColor" d="M0,48 C240,90 480,0 720,32 C960,64 1200,10 1440,48 L1440,80 L0,80 Z" /></svg></section>
    <section id="katalog" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-3xl font-extrabold">Barang di sekretariat</h2><p className="mt-1 text-slate-500">{items === null ? "Memuat..." : "Menampilkan " + list.length + " dari " + all.length + " barang"}</p></div>
        <div className="flex flex-wrap items-center gap-2"><select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium outline-none"><option value="nama">Urut nama</option><option value="tersedia">Paling tersedia</option><option value="stok">Stok terbanyak</option></select>
          <button onClick={() => setOnly(!only)} className={"rounded-xl border px-3.5 py-2 text-sm font-semibold transition " + (only ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600")}>Hanya tersedia</button>
          <div className="flex rounded-xl border border-slate-200 bg-white p-1">{[["grid", LayoutGrid], ["list", List]].map(([k, I]) => <button key={k} onClick={() => setView(k)} aria-label={k} className={"rounded-lg p-1.5 " + (view === k ? "bg-blue-600 text-white" : "text-slate-500")}><I size={18} /></button>)}</div></div></div>
      <div className="mb-6 flex flex-wrap gap-2">{cats.map((c) => <button key={c} onClick={() => setCat(c)} className={"rounded-full px-4 py-1.5 text-sm font-semibold transition " + (cat === c ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-blue-50")}>{c}</button>)}</div>
      {err && <p className="mb-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">Gagal memuat data: {err}</p>}
      {items === null ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((n) => <div key={n} className="h-80 animate-pulse rounded-2xl bg-white/80" />)}</div> :
        <div className={view === "grid" ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>{list.map(card)}{!list.length && <p className="col-span-full py-12 text-center text-slate-500">Tidak ada barang yang cocok dengan filter.</p>}</div>}
    </section>
    <section className="bg-white/70 py-16"><div className="mx-auto max-w-6xl px-4"><h2 className="text-3xl font-extrabold">Cara meminjam</h2><p className="mt-1 text-slate-500">Empat langkah singkat dari cari sampai kembali.</p>
      <ol className="relative mt-10 grid gap-6 md:grid-cols-4"><span className="absolute left-0 right-0 top-7 hidden border-t-2 border-dashed border-blue-200 md:block" />
        {STEPS.map(([I, t, d], n) => <li key={t} className="relative text-center"><div className="relative mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-600/30"><I size={24} /><span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-white text-xs font-bold text-blue-700 shadow">{n + 1}</span></div><h3 className="mt-4 font-bold">{t}</h3><p className="mt-1 text-sm text-slate-500">{d}</p></li>)}</ol></div></section>
    <section className="mx-auto max-w-3xl px-4 py-16"><h2 className="text-center text-3xl font-extrabold">Pertanyaan umum</h2>
      <div className="mt-8 space-y-3">{FAQ.map(([t, d], n) => <div key={t} className="overflow-hidden rounded-2xl border border-white bg-white shadow-[0_8px_30px_rgba(30,64,175,0.06)]"><button onClick={() => setFaq(faq === n ? -1 : n)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold">{t}<ChevronDown size={18} className={"flex-none transition " + (faq === n ? "rotate-180 text-blue-600" : "text-slate-400")} /></button><div className={"grid transition-all duration-300 " + (faq === n ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}><p className="overflow-hidden px-5 text-sm text-slate-600"><span className="block pb-4">{d}</span></p></div></div>)}</div></section>
    <footer className="bg-slate-900 py-10 text-center text-sm text-slate-400"><p className="font-display font-bold text-white">PinjamSekre</p><p className="mt-1">Proyek Komputasi Awan • Next.js, Supabase, dan Docker</p></footer>
    {sel && <div onClick={() => setSel(null)} className="fixed inset-0 z-40 grid place-items-center bg-slate-900/60 p-4 backdrop-blur-sm"><div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md animate-pop overflow-hidden rounded-3xl bg-white shadow-2xl">
      <button onClick={() => setSel(null)} aria-label="Tutup" className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-1.5 shadow"><X size={18} /></button><ItemImg item={sel} className="h-52" />
      <div className="p-6"><h2 className="text-2xl font-extrabold">{sel.nama}</h2><p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin size={14} />{sel.lokasi}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">{[["Kategori", sel.kategori], ["Kondisi", sel.kondisi], ["Total stok", sel.stok + " unit"], ["Tersedia", av(sel) + " unit"]].map(([k, v]) => <div key={k} className="rounded-xl bg-slate-50 p-3"><dt className="text-xs text-slate-500">{k}</dt><dd className="font-bold">{v}</dd></div>)}</dl>
        <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Denda keterlambatan <b>{rupiah(sel.denda_per_hari)}</b> per hari per unit.</p>
        <div className="mt-5 flex gap-2"><button onClick={() => setSel(null)} className={bS}>Tutup</button>{!isAdmin && <button disabled={av(sel) <= 0} onClick={() => pinjam(sel)} className={bP + " flex-1"}>Ajukan peminjaman</button>}</div></div></div></div>}
  </>);
}
