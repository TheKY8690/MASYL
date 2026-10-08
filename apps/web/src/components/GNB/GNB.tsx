'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { useSession } from '../../hooks/useSession';
import { parseAppTab, tabHref, type AppTab } from '../../lib/tabs';
import {
  gnb,
  logo,
  logoAccent,
  nav,
  navItem,
  navItemActive,
  right,
  locationChip,
  locationDot,
  profileBtn,
} from './GNB.css';

const NAV_ITEMS: { id: AppTab; label: string }[] = [
  { id: 'home', label: '홈' },
  { id: 'map', label: '지도' },
  { id: 'benefits', label: '혜택' },
  { id: 'my', label: '마이' },
];

export function GNB() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locationName = useCurrentLocation();
  const { session, ready } = useSession();
  const activeTab =
    pathname === '/' ? parseAppTab(searchParams.get('tab')) : null;

  return (
    <header className={gnb}>
      <Link href="/" className={logo}>
        마<span className={logoAccent}>실</span>
      </Link>

      <nav className={nav}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`${navItem}${activeTab === item.id ? ` ${navItemActive}` : ''}`}
            onClick={() => router.push(tabHref(item.id))}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className={right}>
        <button type="button" className={locationChip}>
          <span className={locationDot} />
          {locationName}
        </button>
        {ready && session ? (
          <button
            type="button"
            className={profileBtn}
            onClick={() => router.push(tabHref('my'))}
          >
            {(session.user.email ?? '나').slice(0, 1).toUpperCase()}
          </button>
        ) : (
          <Link href="/login" className={locationChip}>
            로그인
          </Link>
        )}
      </div>
    </header>
  );
}
