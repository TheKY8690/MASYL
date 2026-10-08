'use client';

import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { createClient } from '../lib/supabase';

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, next) => setSession(next));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const token = session?.access_token;
    if (!token) return;
    const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
    void fetch(`${api}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }, [session?.access_token]);

  return { session, token: session?.access_token ?? null, ready };
}
