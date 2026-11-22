"use client";
import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
const C = createContext(() => {});
export const useToast = () => useContext(C);
export function ToastProvider({ children }) {
  const [L, setL] = useState([]);
  const push = useCallback((m, t = "ok") => { const id = Math.random(); setL((l) => [...l, { id, m, t }]); setTimeout(() => setL((l) => l.filter((x) => x.id !== id)), 3500); }, []);
  return <C.Provider value={push}>{children}<div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">{L.map((x) => <div key={x.id} className="flex max-w-sm animate-pop items-center gap-2.5 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-2xl">{x.t === "err" ? <AlertCircle size={18} className="flex-none text-rose-400" /> : <CheckCircle2 size={18} className="flex-none text-emerald-400" />}{x.m}</div>)}</div></C.Provider>;
}
