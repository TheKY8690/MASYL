import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
import Providers from './providers';
import { GNB } from '../components/GNB/GNB';
import { SplashScreen } from '../components/SplashScreen/SplashScreen';
import './globals.css';

export const metadata: Metadata = {
  title: '마실 — 내 주변 카페 할인 찾기',
  description: '주변 카페 할인 정보를 실시간으로 찾아드립니다',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#F0EDE8',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body>
        <Script
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false&libraries=services`}
          strategy="afterInteractive"
        />
        <Providers>
          <SplashScreen />
          <GNB />
          {children}
        </Providers>
      </body>
    </html>
  );
}
