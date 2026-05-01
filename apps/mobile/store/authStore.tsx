import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { createProfileIfNotExists } from "@/lib/db";

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  budgetMinutes: number | null;
  displayName: string;
  setBudgetMinutes: (minutes: number) => Promise<void>;
  setDisplayName: (name: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === "SIGNED_IN" && session?.user) {
        const nextMonth = new Date();
        nextMonth.setDate(1);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setHours(0, 0, 0, 0);
        createProfileIfNotExists(session.user.id, nextMonth.toISOString());
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Metadata fields stored in user metadata
  const budgetMinutes = session?.user?.user_metadata?.screen_time_budget_minutes ?? null;
  const displayName: string = session?.user?.user_metadata?.display_name ?? '';

  async function setBudgetMinutes(minutes: number) {
    await supabase.auth.updateUser({
      data: { screen_time_budget_minutes: minutes },
    });
    const { data } = await supabase.auth.refreshSession();
    if (data.session) setSession(data.session);
  }

  async function setDisplayName(name: string) {
    await supabase.auth.updateUser({ data: { display_name: name } });
    const { data } = await supabase.auth.refreshSession();
    if (data.session) setSession(data.session);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ session, loading, budgetMinutes, displayName, setBudgetMinutes, setDisplayName, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
