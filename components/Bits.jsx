"use client";
import { useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import { ST } from "../lib/ui";
export const Badge = ({ s }) => <span className={"rounded-full px-2.5 py-0.5 text-xs font-semibold " + ST[s][1]}>{ST[s][0]}</span>;
export function Count({ n }) {
  const [v, setV] = useState(0);
  useEffect(() => { if (typeof n !== "number") return; let raf, t0; const step = (t) => { t0 = t0 || t; const p = Math.min(1, (t - t0) / 800); setV(Math.round(n * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(step); }; raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf); }, [n]);
  return typeof n === "number" ? v : n;
}
const G = { amber: "from-amber-400 to-orange-500", sky: "from-sky-400 to-blue-500", rose: "from-rose-400 to-pink-500", emerald: "from-emerald-400 to-teal-500", violet: "from-violet-500 to-blue-500", lime: "from-lime-400 to-emerald-500" };
export const Tile = ({ n, l, c = "", i: I }) => { const g = G[(c.match(/amber|sky|rose|emerald|violet|lime/) || [""])[0]] || "from-blue-500 to-cyan-500"; return (
  <div className="animate-up rounded-2xl border border-white bg-white/85 p-5 shadow-[0_8px_30px_rgba(30,64,175,0.07)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(30,64,175,0.14)]">
    {I && <div className={"mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-white shadow-lg " + g}><I size={20} /></div>}
    <div className="text-3xl font-extrabold tracking-tight"><Count n={n} /></div><div className="mt-0.5 text-sm text-slate-500">{l}</div></div>); };
export const Empty = ({ children }) => <div className="rounded-2xl border border-dashed border-blue-200 bg-white/60 py-12 text-center text-sm text-slate-500"><Inbox className="mx-auto mb-2 text-blue-300" size={28} />{children}</div>;
export const Head = ({ t, p, children }) => <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-extrabold md:text-4xl">{t}</h1><p className="mt-1 text-slate-500">{p}</p></div>{children}</div>;
export const Tabs = ({ tabs, v, set }) => <div className="mb-6 max-w-full overflow-x-auto"><div className="inline-flex gap-1 rounded-xl border border-slate-200 bg-white/80 p-1 backdrop-blur">{tabs.map(([k, l, n]) => <button key={k} onClick={() => set(k)} className={"whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition " + (v === k ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-600/25" : "text-slate-600 hover:bg-blue-50")}>{l}{n ? <span className={"ml-1.5 rounded-full px-1.5 text-xs " + (v === k ? "bg-white/25" : "bg-blue-600 text-white")}>{n}</span> : null}</button>)}</div></div>;
export const H2 = ({ children }) => <h2 className="mb-4 mt-10 flex items-center gap-2.5 text-xl font-bold"><span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-blue-600 to-cyan-400" />{children}</h2>;
