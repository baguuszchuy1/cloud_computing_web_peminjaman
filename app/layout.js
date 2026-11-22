import "./globals.css";
import { AuthProvider } from "../components/Auth";
import { ToastProvider } from "../components/Toast";
import Nav from "../components/Nav";
export const metadata = { title: "PinjamSekre – Peminjaman Barang Sekretariat Prodi", description: "Sistem peminjaman barang sekretariat program studi." };
export default function Root({ children }) {
  return (<html lang="id"><head><link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" /></head>
    <body className="font-sans text-slate-900 antialiased"><AuthProvider><ToastProvider><Nav />{children}</ToastProvider></AuthProvider></body></html>);
}
