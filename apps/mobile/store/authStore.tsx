import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  budgetMinutes: number | null;
  setBudgetMinutes: (minutes: number) => Promise<void>;
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Budget is stored in user metadata so we don't need a DB table yet
  const budgetMinutes = session?.user?.user_metadata?.screen_time_budget_minutes ?? null;

  async function setBudgetMinutes(minutes: number) {
    await supabase.auth.updateUser({
      data: { screen_time_budget_minutes: minutes },
    });
    // Refresh session so metadata updates locally
    const { data } = await supabase.auth.refreshSession();
    if (data.session) setSession(data.session);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ session, loading, budgetMinutes, setBudgetMinutes, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
