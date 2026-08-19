'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase';
import { useSession } from '../hooks/useSession';

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session } = useSession();

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const links = [
    { href: '/crawl', label: '크롤링' },
    { href: '/discounts', label: '할인관리' },
  ];

  const active = (href: string) => pathname.startsWith(href);

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 32px',
        height: 56,
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Link
        href="/"
        style={{
          fontWeight: 700,
          fontSize: 16,
          color: '#1e1e2e',
          textDecoration: 'none',
          marginRight: 16,
        }}
      >
        마실 어드민
      </Link>

      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          style={{
            padding: '6px 14px',
            borderRadius: 6,
            textDecoration: 'none',
            fontWeight: active(l.href) ? 600 : 400,
            color: active(l.href) ? '#6366f1' : '#374151',
            background: active(l.href) ? '#ede9fe' : 'transparent',
          }}
        >
          {l.label}
        </Link>
      ))}

      <div style={{ flex: 1 }} />

      {session && (
        <button
          onClick={() => void signOut()}
          style={{
            background: 'none',
            border: '1px solid #e5e7eb',
            borderRadius: 6,
            padding: '6px 14px',
            cursor: 'pointer',
            color: '#6b7280',
            fontSize: 13,
          }}
        >
          로그아웃
        </button>
      )}
    </nav>
  );
}
