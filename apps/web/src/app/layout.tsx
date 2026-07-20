import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Masyl',
  description: 'Masyl App',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
