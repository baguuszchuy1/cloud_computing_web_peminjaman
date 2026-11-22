"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./Auth";
import { bP, bG, bS, sm } from "../lib/ui";
export default function Nav() {
  const { user, profile } = useAuth(), r = useRouter(), p = usePathname();
  const links = [["/", "Katalog"], ...(!user ? [] : profile?.role === "admin" ? [["/admin", "Panel Admin"]] : [["/dashboard", "Dashboard"], ["/ajukan", "Ajukan Peminjaman"]])];
  const L = (h, t) => <Link key={h} href={h} className={"whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-semibold transition " + (p === h ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-white")}>{t}</Link>;
  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-extrabold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-600/30"><GraduationCap size={20} /></span>PinjamSekre</Link>
        <nav className="ml-4 hidden gap-1 md:flex">{links.map(([h, t]) => L(h, t))}</nav>
        <div className="ml-auto flex items-center gap-2">
          {user ? <><span className="hidden text-sm font-semibold sm:block">{profile?.nama}</span><button className={bS + sm} onClick={async () => { await supabase.auth.signOut(); r.push("/"); }}>Keluar</button></> :
            <><Link href="/login" className={bG}>Masuk</Link><Link href="/login?mode=daftar" className={bP}>Daftar</Link></>}
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">{links.map(([h, t]) => L(h, t))}</nav>
    </header>);
}
