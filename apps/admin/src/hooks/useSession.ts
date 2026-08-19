'use client';

import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { createClient } from '../lib/supabase';

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  return { session, token: session?.access_token ?? null };
}
