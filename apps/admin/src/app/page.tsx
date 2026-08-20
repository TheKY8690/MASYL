import Link from 'next/link';

export default function AdminHomePage() {
  return (
    <main
      style={{
        padding: '48px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        alignItems: 'flex-start',
      }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>마실 어드민</h1>
      <Link
        href="/crawl"
        style={{
          color: '#6366f1',
          fontSize: 16,
          textDecoration: 'none',
          fontWeight: 500,
        }}
      >
        크롤링 관리 →
      </Link>
      <Link
        href="/discounts"
        style={{
          color: '#6366f1',
          fontSize: 16,
          textDecoration: 'none',
          fontWeight: 500,
        }}
      >
        할인 관리 →
      </Link>
    </main>
  );
}
