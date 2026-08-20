import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Providers from './providers';
import NavBar from './NavBar';

export const metadata: Metadata = {
  title: 'Masyl Admin',
  description: 'Masyl Admin Panel',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          fontFamily: 'system-ui, sans-serif',
          background: '#f9fafb',
        }}
      >
        <Providers>
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
