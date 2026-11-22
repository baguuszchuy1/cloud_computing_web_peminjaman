const B = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 active:scale-95 disabled:opacity-50 ";
export const bP = B + "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-600/25 hover:-translate-y-0.5 hover:shadow-blue-600/40";
export const bS = B + "bg-blue-50 text-blue-700 hover:bg-blue-100";
export const bR = B + "bg-rose-50 text-rose-600 hover:bg-rose-100";
export const bG = B + "text-slate-700 hover:bg-white";
export const sm = " !px-3 !py-1.5 !text-[13px]";
export const IN = "w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
export const CARD = "animate-up rounded-2xl border border-white bg-white/85 p-5 shadow-[0_8px_30px_rgba(30,64,175,0.07)] backdrop-blur";
export const ST = {
  menunggu: ["Menunggu", "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"], disetujui: ["Sedang dipinjam", "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200"],
  ditolak: ["Ditolak", "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200"], selesai: ["Sudah dikembalikan", "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"] };
const p2 = (n) => String(n).padStart(2, "0");
export const ymd = (d) => d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate());
export const hm = (d) => p2(d.getHours()) + ":" + p2(d.getMinutes());
export const rupiah = (n) => "Rp " + (n || 0).toLocaleString("id-ID");
export const fdt = (d) => new Date(d).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).replace(/(\d{2})\.(\d{2})$/, "$1:$2");
export const telatHari = (l, at = new Date()) => { const ms = at - new Date(l.selesai); return ms > 0 ? Math.ceil(ms / 864e5) : 0; };
export const dendaHitung = (l, at = new Date()) => telatHari(l, at) * (l.items?.denda_per_hari || 0) * l.qty;
export const durasi = (a, b) => { const m = Math.round((b - a) / 6e4); if (m <= 0) return "-"; const d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mm = m % 60; return [d && d + " hari", h && h + " jam", mm && mm + " menit"].filter(Boolean).join(" "); };
export const sisaTxt = (l) => { const ms = new Date(l.selesai) - new Date(); if (ms <= 0) return "Terlambat " + telatHari(l) + " hari"; const h = Math.floor(ms / 36e5); return h >= 24 ? "Sisa " + Math.floor(h / 24) + " hari" : h >= 1 ? "Sisa " + h + " jam" : "Sisa " + Math.max(1, Math.floor(ms / 6e4)) + " menit"; };
export function unduhCSV(L) {
  const q = (v) => '"' + String(v ?? "").replace(/"/g, '""') + '"';
  const rows = [["Peminjam", "NIM", "Barang", "Jumlah", "Mulai", "Selesai", "Tujuan", "Status", "Dikembalikan", "Kondisi", "Denda", "Lunas"], ...L.map((l) => [l.profiles?.nama, l.profiles?.nim, l.items?.nama, l.qty, fdt(l.mulai), fdt(l.selesai), l.tujuan, l.status, l.dikembalikan_pada ? fdt(l.dikembalikan_pada) : "", l.kondisi_kembali, l.denda, l.denda_lunas ? "Ya" : "Tidak"])];
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["\ufeff" + rows.map((r) => r.map(q).join(",")).join("\n")], { type: "text/csv" })); a.download = "riwayat-peminjaman.csv"; a.click();
}
