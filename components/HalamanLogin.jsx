"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { bP, IN, CARD } from "../lib/ui";
const MSG = { "Invalid login credentials": "Email atau kata sandi salah.", "User already registered": "Email sudah terdaftar. Silakan masuk.", "Email not confirmed": "Email belum dikonfirmasi. Cek kotak masuk email Anda." };
export default function Login() {
  const r = useRouter(), [reg, setReg] = useState(false), [f, setF] = useState({ nama: "", nim: "", email: "", pw: "" }), [err, setErr] = useState(""), [busy, setBusy] = useState(false), [next, setNext] = useState("");
  useEffect(() => { const p = new URLSearchParams(location.search); setReg(p.get("mode") === "daftar"); setNext(p.get("next") || ""); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function submit(e) {
    e.preventDefault(); setErr("");
    if (!f.email || !f.pw || (reg && !f.nama)) return setErr("Lengkapi semua kolom yang wajib.");
    setBusy(true);
    const res = reg ? await supabase.auth.signUp({ email: f.email, password: f.pw, options: { data: { nama: f.nama, nim: f.nim } } }) : await supabase.auth.signInWithPassword({ email: f.email, password: f.pw });
    setBusy(false);
    if (res.error) return setErr(MSG[res.error.message] || res.error.message);
    if (!res.data.session) return setErr("Akun dibuat. Cek email untuk konfirmasi, lalu masuk.");
    r.push(next || "/dashboard");
  }
  return (<div className="relative grid min-h-[88vh] place-items-center overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 px-4 py-10"><span className="absolute -left-20 top-10 h-72 w-72 animate-float rounded-full bg-white/10 blur-2xl" /><div className="w-full max-w-md">
    <Link href="/" className="mb-5 inline-block text-sm font-semibold text-white/90 hover:text-white">← Kembali ke daftar barang</Link>
    <form onSubmit={submit} className={CARD + " !p-8 !bg-white shadow-2xl"}>
      <h1 className="text-3xl font-semibold">{reg ? "Buat akun mahasiswa" : "Masuk"}</h1>
      <p className="mt-1 text-slate-500">{reg ? "Isi data untuk mulai meminjam." : "Mahasiswa dan admin prodi masuk dari sini."}</p>
      {next && <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">Masuk dulu untuk melanjutkan peminjaman.</div>}
      {reg && <><label className="mt-4 block text-sm font-semibold">Nama lengkap</label><input className={IN + " mt-1.5"} value={f.nama} onChange={set("nama")} />
        <label className="mt-4 block text-sm font-semibold">NIM</label><input className={IN + " mt-1.5"} value={f.nim} onChange={set("nim")} /></>}
      <label className="mt-4 block text-sm font-semibold">Email</label><input type="email" className={IN + " mt-1.5"} value={f.email} onChange={set("email")} />
      <label className="mt-4 block text-sm font-semibold">Kata sandi</label><input type="password" className={IN + " mt-1.5"} value={f.pw} onChange={set("pw")} placeholder="Minimal 6 karakter" />
      <p className="mt-3 min-h-5 text-sm font-semibold text-rose-600">{err}</p>
      <button disabled={busy} className={bP + " mt-1 w-full py-3"}>{busy ? "Memproses..." : reg ? "Daftar" : "Masuk"}</button>
      <p className="mt-4 text-sm text-slate-500">{reg ? "Sudah punya akun?" : "Belum punya akun?"} <button type="button" onClick={() => { setReg(!reg); setErr(""); }} className="font-semibold text-blue-700">{reg ? "Masuk" : "Daftar di sini"}</button></p>
    </form></div></div>);
}
