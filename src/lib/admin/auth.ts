import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, loading };
}

export function useIsAdmin() {
  const { session, loading: sessionLoading } = useAuthSession();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (sessionLoading) return;
    if (!session) {
      setIsAdmin(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error) {
        console.error(error);
        setIsAdmin(false);
        return;
      }
      setIsAdmin(!!data);
    })();
  }, [session, sessionLoading]);

  return { session, isAdmin, loading: sessionLoading || isAdmin === null };
}

export async function signOut() {
  await supabase.auth.signOut();
}
