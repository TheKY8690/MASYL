'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase';
import { useSession } from '../../hooks/useSession';

export default function LoginPage() {
  const router = useRouter();
  const { session } = useSession();

  useEffect(() => {
    if (session) router.replace('/crawl');
  }, [session, router]);

  const signIn = async (provider: 'kakao') => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 16,
      }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
        마실 어드민
      </h1>
      <button
        onClick={() => void signIn('kakao')}
        style={btnStyle('#FEE500', '#000')}
      >
        카카오로 로그인
      </button>
    </main>
  );
}

function btnStyle(bg: string, color = '#fff') {
  return {
    background: bg,
    color,
    border: 'none',
    borderRadius: 8,
    padding: '12px 32px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    width: 220,
  } as const;
}
