"use client";

import { useEffect, useState } from "react";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/session-constants";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

function setSessionCookie(userId: string | null) {
  if (typeof document === "undefined") return;

  if (!userId) {
    document.cookie = `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
    return;
  }

  document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(
    userId,
  )}; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export async function signIn(email: string, senha: string) {
  if (!isSupabaseConfigured) {
    return { userId: null, error: "Supabase nao configurado neste ambiente." };
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: senha,
  });

  if (error) {
    return { userId: null, error: "Credenciais invalidas. Verifique email e senha." };
  }

  const userId = data.user?.id ?? null;
  setSessionCookie(userId);
  return { userId, error: null };
}

export async function signOut() {
  if (!isSupabaseConfigured) {
    setSessionCookie(null);
    return;
  }

  const supabase = getSupabaseClient();
  await supabase.auth.signOut();
  setSessionCookie(null);
}

export async function getSessionUserIdClient(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id ?? null;
  setSessionCookie(userId);
  return userId;
}

export function useSessionUserId() {
  const [sessionUserId, setSessionUserId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSessionUserId(null);
      return;
    }

    let alive = true;
    const supabase = getSupabaseClient();

    getSessionUserIdClient().then((userId) => {
      if (alive) setSessionUserId(userId);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUserId = session?.user?.id ?? null;
      setSessionCookie(nextUserId);
      if (alive) setSessionUserId(nextUserId);
    });

    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return sessionUserId;
}

