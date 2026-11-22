"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertTriangle, Minus, Plus, Clock3 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useGuard } from "./Auth";
import { Head } from "./Bits";
import ItemImg from "./ItemImg";
import { bP, CARD, IN, ymd, hm, rupiah, fdt, durasi } from "../lib/ui";
const lbl = "mb-1.5 block text-sm font-semibold";
const dt = (d, t) => new Date(d + "T" + t);
export default function Ajukan() {
  const { user } = useGuard("mahasiswa"), r = useRouter(), [items, setItems] = useState([]), [err, setErr] = useState(""), [busy, setBusy] = useState(false), [cek, setCek] = useState(null);
  const [f, setF] = useState(() => { const s = new Date(); s.setMinutes(0, 0, 0); s.setHours(s.getHours() + 1); const e = new Date(+s + 72e5); return { item_id: "", qty: 1, d1: ymd(s), t1: hm(s), d2: ymd(e), t2: hm(e), tujuan: "" }; });
  useEffect(() => { supabase.from("item_stock").select("*").order("nama").then(({ data }) => { setItems(data || []); const id = new URLSearchParams(location.search).get("item"); setF((p) => ({ ...p, item_id: id || (data && data[0] ? String(data[0].id) : "") })); }); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const it = items.find((i) => String(i.id) === String(f.item_id)), a = dt(f.d1, f.t1), b = dt(f.d2, f.t2), ok = !isNaN(a) && !isNaN(b) && b > a;
  const chip = (h) => { const e = new Date(+a + h * 36e5); setF({ ...f, d2: ymd(e), t2: hm(e) }); };
  useEffect(() => {
    if (!it || !ok || !user) { setCek(null); return; }
    let live = true;
    Promise.all([
      supabase.rpc("stok_tersedia", { p_item: it.id, p_mulai: a.toISOString(), p_selesai: b.toISOString() }),
      supabase.from("loans").select("mulai,selesai,status").eq("user_id", user.id).eq("item_id", it.id).in("status", ["menunggu", "disetujui"]).lt("mulai", b.toISOString()).gt("selesai", a.toISOString()),
    ]).then(([s, o]) => { if (live) setCek({ sisa: s.data ?? 0, own: o.data || [] }); });
    return () => { live = false; };
  }, [it?.id, f.d1, f.t1, f.d2, f.t2, user]);
  const q = parseInt(f.qty) || 0, kurang = cek && q > cek.sisa, dobel = cek && cek.own.length > 0;
  async function submit(e) {
    e.preventDefault(); setErr("");
    if (!it || q < 1 || !f.tujuan.trim()) return setErr("Lengkapi barang, jumlah, dan tujuan peminjaman.");
    if (!ok) return setErr("Waktu kembali harus setelah waktu pinjam.");
    if (a < new Date(Date.now() - 6e5)) return setErr("Waktu pinjam tidak boleh di masa lalu.");
    if (dobel) return setErr("Kamu sudah punya pengajuan barang ini pada waktu yang bersinggungan.");
    if (kurang) return setErr("Bentrok jadwal: hanya " + cek.sisa + " unit tersedia pada waktu tersebut.");
    setBusy(true);
    const { error } = await supabase.from("loans").insert({ user_id: user.id, item_id: it.id, qty: q, mulai: a.toISOString(), selesai: b.toISOString(), tujuan: f.tujuan.trim() });
    setBusy(false);
    if (error) return setErr(error.message);
    r.push("/dashboard");
  }
  return (<main className="mx-auto max-w-6xl px-4 py-10"><Head t="Ajukan Peminjaman" p="Pilih barang dan tentukan waktunya. Bentrok jadwal dicek otomatis." />
    <form onSubmit={submit} className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <section className={CARD}><h2 className="mb-3 text-lg font-semibold">1. Pilih barang</h2>
          <div className="grid max-h-72 grid-cols-2 gap-3 overflow-y-auto p-1 sm:grid-cols-3">
            {items.map((i) => <button type="button" key={i.id} onClick={() => setF({ ...f, item_id: String(i.id) })} className={"overflow-hidden rounded-xl border-2 text-left transition " + (String(i.id) === String(f.item_id) ? "border-blue-600 ring-4 ring-blue-100" : "border-slate-200 hover:border-blue-300")}>
              <ItemImg item={i} className="aspect-square" /><div className="p-2.5"><p className="text-sm font-semibold leading-tight">{i.nama}</p><p className="text-xs text-slate-500">Stok {i.stok}</p></div></button>)}</div></section>
        <section className={CARD}><h2 className="mb-3 text-lg font-semibold">2. Atur waktu dan jumlah</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className={lbl}>Mulai pinjam</label><div className="flex gap-2"><input type="date" className={IN} value={f.d1} onChange={set("d1")} /><input type="time" className={IN + " !w-32"} value={f.t1} onChange={set("t1")} /></div></div>
            <div><label className={lbl}>Waktu kembali</label><div className="flex gap-2"><input type="date" className={IN} value={f.d2} min={f.d1} onChange={set("d2")} /><input type="time" className={IN + " !w-32"} value={f.t2} onChange={set("t2")} /></div></div></div>
          <div className="mt-3 flex flex-wrap items-center gap-2"><span className="text-sm text-slate-500">Durasi cepat:</span>{[["2 jam", 2], ["4 jam", 4], ["1 hari", 24], ["3 hari", 72]].map(([t, h]) => <button type="button" key={t} onClick={() => chip(h)} className="rounded-full border border-slate-200 px-3.5 py-1 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700">{t}</button>)}</div>
          <label className={lbl + " mt-5"}>Jumlah unit</label>
          <div className="inline-flex items-center rounded-xl border border-slate-200"><button type="button" onClick={() => setF({ ...f, qty: Math.max(1, q - 1) })} className="p-3 text-slate-600 hover:text-blue-700"><Minus size={18} /></button><input type="number" min="1" value={f.qty} onChange={set("qty")} className="w-16 border-x border-slate-200 py-2 text-center font-semibold outline-none" /><button type="button" onClick={() => setF({ ...f, qty: q + 1 })} className="p-3 text-slate-600 hover:text-blue-700"><Plus size={18} /></button></div></section>
        <section className={CARD}><h2 className="mb-3 text-lg font-semibold">3. Tujuan peminjaman</h2>
          <textarea rows="3" className={IN} value={f.tujuan} onChange={set("tujuan")} placeholder="Contoh: seminar proposal, kegiatan himpunan, rapat angkatan" /></section>
      </div>
      <aside className={CARD + " space-y-4 lg:sticky lg:top-24"}>
        {it && <><ItemImg item={it} className="aspect-square rounded-xl" /><h3 className="text-lg font-semibold">{it.nama}</h3></>}
        <dl className="space-y-2 text-sm"><div className="flex justify-between"><dt className="text-slate-500">Mulai</dt><dd className="font-semibold">{ok ? fdt(a) : "-"}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Kembali</dt><dd className="font-semibold">{ok ? fdt(b) : "-"}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Durasi</dt><dd className="font-semibold">{ok ? durasi(a, b) : "-"}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Jumlah</dt><dd className="font-semibold">{q} unit</dd></div></dl>
        {!ok && <p className="flex gap-2 rounded-xl bg-amber-50 p-3 text-sm font-medium text-amber-800"><Clock3 size={18} className="flex-none" />Waktu kembali harus setelah waktu pinjam.</p>}
        {cek && !dobel && !kurang && <p className="flex gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800"><CheckCircle2 size={18} className="flex-none" />Tersedia: {cek.sisa} unit pada waktu ini.</p>}
        {cek && kurang && <p className="flex gap-2 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700"><AlertTriangle size={18} className="flex-none" />Bentrok jadwal. Pada waktu ini hanya {cek.sisa} unit tersedia. Kurangi jumlah atau ganti waktu.</p>}
        {dobel && <p className="flex gap-2 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700"><AlertTriangle size={18} className="flex-none" />Kamu sudah punya pengajuan barang ini pada waktu yang bersinggungan ({fdt(cek.own[0].mulai)}).</p>}
        {it && <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">Jika terlambat mengembalikan, denda <b>{rupiah(it.denda_per_hari)}</b> per hari per unit (dibulatkan ke atas).</p>}
        <p className="min-h-5 text-sm font-semibold text-rose-600">{err}</p>
        <button disabled={busy || kurang || dobel || !ok} className={bP + " w-full py-3"}>{busy ? "Mengirim..." : "Kirim pengajuan"}</button>
      </aside></form></main>);
}
