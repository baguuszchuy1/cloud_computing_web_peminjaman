import { CARD, bP, bR, bS, sm, fdt, rupiah, telatHari, dendaHitung } from "../lib/ui";
import { Badge } from "./Bits";
import ItemImg from "./ItemImg";
export default function LoanCard({ l, admin, onAct }) {
  const A = (a, t, c) => <button onClick={() => onAct(a, l)} className={c + sm}>{t}</button>;
  const late = l.status === "disetujui" && telatHari(l) > 0, denda = late ? dendaHitung(l) : l.denda, idx = { menunggu: 0, disetujui: 1, selesai: 2 }[l.status];
  let b = null;
  if (admin) { if (l.status === "menunggu") b = <>{A("setuju", "Setujui", bP)}{A("tolak", "Tolak", bR)}</>; else if (l.status === "disetujui") b = A("selesai", "Konfirmasi pengembalian", bP); else if (l.status === "selesai" && l.denda > 0 && !l.denda_lunas) b = A("lunas", "Tandai denda lunas", bS); }
  else if (l.status === "menunggu") b = A("batal", "Batalkan", bS);
  return (
    <div className={CARD + " mb-3 flex flex-wrap items-center justify-between gap-4"}>
      <div className="flex min-w-64 flex-1 items-center gap-4">
        <ItemImg item={{ ...l.items, id: l.item_id }} className="h-16 w-16 flex-none rounded-xl" />
        <div className="min-w-0">
          <h3 className="font-semibold">{l.items?.nama} × {l.qty}</h3>
          <p className="text-sm text-slate-500">{admin && l.profiles ? l.profiles.nama + (l.profiles.nim ? " (" + l.profiles.nim + ")" : "") + " • " : ""}{fdt(l.mulai)} → {fdt(l.selesai)}</p>
          <p className="text-sm text-slate-500">{l.tujuan}</p>
          {l.catatan_admin && <p className="text-sm text-rose-600">Catatan admin: {l.catatan_admin}</p>}
          {l.kondisi_kembali && <p className="text-sm text-slate-500">Kondisi saat kembali: {l.kondisi_kembali}</p>}
          {denda > 0 && <p className={"text-sm font-semibold " + (l.denda_lunas ? "text-emerald-600" : "text-rose-600")}>{late ? "Denda berjalan " : "Denda "}{rupiah(denda)}{l.status === "selesai" ? (l.denda_lunas ? " (lunas)" : " (belum lunas)") : ""}</p>}
          {l.status !== "ditolak" && <ol className="mt-2 flex items-center gap-1.5 text-xs">{["Diajukan", "Dipinjam", "Dikembalikan"].map((s, n) => <li key={s} className="flex items-center gap-1.5"><span className={"h-2 w-2 rounded-full " + (n <= idx ? "bg-blue-600" : "bg-slate-300")} /><span className={n <= idx ? "font-semibold text-slate-700" : "text-slate-400"}>{s}</span>{n < 2 && <span className="h-px w-4 bg-slate-300" />}</li>)}</ol>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">{late ? <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700">Terlambat {telatHari(l)} hari</span> : <Badge s={l.status} />}{b}</div>
    </div>);
}
