'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WEB_LOGIN_PROVIDERS } from '@masyl/types';
import { createClient } from '../../lib/supabase';
import { useSession } from '../../hooks/useSession';
import * as s from './login.css';

export default function LoginPage() {
  const router = useRouter();
  const { session, ready } = useSession();

  useEffect(() => {
    if (ready && session) router.replace('/?tab=my');
  }, [ready, session, router]);

  const signInGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: WEB_LOGIN_PROVIDERS[0],
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <main className={s.main}>
      <h1 className={s.title}>마실</h1>
      <p className={s.sub}>카페 할인을 쓰려면 Google로 로그인하세요</p>
      <button
        className={s.google}
        type="button"
        onClick={() => void signInGoogle()}
      >
        Google로 로그인
      </button>
    </main>
  );
}
