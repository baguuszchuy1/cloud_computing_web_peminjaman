import { CARD } from "../lib/ui";
export default function Charts({ L }) {
  const data = [...Array(6)].map((_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 5 + i); return { l: d.toLocaleString("id-ID", { month: "short" }), n: L.filter((x) => { const c = new Date(x.created_at); return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear(); }).length }; });
  const max = Math.max(1, ...data.map((d) => d.n));
  const st = [["menunggu", "Menunggu", "#f59e0b"], ["disetujui", "Dipinjam", "#2563eb"], ["selesai", "Selesai", "#10b981"], ["ditolak", "Ditolak", "#f43f5e"]].map(([k, l, c]) => ({ l, c, n: L.filter((x) => x.status === k).length }));
  const tot = st.reduce((a, x) => a + x.n, 0) || 1, C = 2 * Math.PI * 40; let off = 0;
  return (<div className="mt-6 grid gap-4 md:grid-cols-5">
    <div className={CARD + " md:col-span-3"}><h3 className="font-bold">Pengajuan per bulan</h3><p className="text-sm text-slate-500">Enam bulan terakhir</p>
      <div className="mt-5 flex h-44 items-end gap-3">{data.map((d) => <div key={d.l} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-xs font-semibold text-slate-600">{d.n}</span><div className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-700" style={{ height: (d.n / max) * 100 + "%", minHeight: 4 }} /><span className="text-xs text-slate-500">{d.l}</span></div>)}</div></div>
    <div className={CARD + " md:col-span-2"}><h3 className="font-bold">Komposisi status</h3>
      <div className="mt-4 flex items-center gap-5"><svg viewBox="0 0 100 100" className="h-36 w-36 flex-none -rotate-90"><circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="14" />{st.map((x) => { const len = (x.n / tot) * C, el = <circle key={x.l} cx="50" cy="50" r="40" fill="none" stroke={x.c} strokeWidth="14" strokeDasharray={len + " " + (C - len)} strokeDashoffset={-off} />; off += len; return el; })}</svg>
        <ul className="space-y-2 text-sm">{st.map((x) => <li key={x.l} className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: x.c }} /><span className="text-slate-600">{x.l}</span><b>{x.n}</b></li>)}</ul></div></div></div>);
}
