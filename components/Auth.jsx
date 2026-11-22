"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
const Ctx = createContext({});
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null), [profile, setProfile] = useState(null), [loading, setLoading] = useState(true);
  useEffect(() => {
    const load = async (s) => {
      const u = s?.user || null; setUser(u);
      if (u) { const { data } = await supabase.from("profiles").select("*").eq("id", u.id).single(); setProfile(data); } else setProfile(null);
      setLoading(false);
    };
    supabase.auth.getSession().then(({ data }) => load(data.session));
    const { data: l } = supabase.auth.onAuthStateChange((_e, s) => { setTimeout(() => load(s), 0); });
    return () => l.subscription.unsubscribe();
  }, []);
  return <Ctx.Provider value={{ user, profile, loading }}>{children}</Ctx.Provider>;
}
export function useGuard(role) {
  const a = useAuth(), r = useRouter();
  useEffect(() => {
    if (a.loading) return;
    if (!a.user) r.replace("/login?next=" + encodeURIComponent(location.pathname + location.search));
    else if (a.profile && a.profile.role !== role) r.replace(a.profile.role === "admin" ? "/admin" : "/dashboard");
  }, [a.loading, a.user, a.profile]);
  return a;
}
