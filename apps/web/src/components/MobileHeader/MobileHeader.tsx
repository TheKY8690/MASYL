'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '../../hooks/useSession';
import { tabHref } from '../../lib/tabs';
import {
  header,
  hamburger,
  title,
  titleAccent,
  profileBtn,
} from './MobileHeader.css';

interface MobileHeaderProps {
  pageTitle?: string;
  isMapView?: boolean;
}

export function MobileHeader({ pageTitle, isMapView }: MobileHeaderProps) {
  const router = useRouter();
  const { session, ready } = useSession();

  return (
    <div className={header}>
      <button
        type="button"
        className={hamburger}
        onClick={() => router.push('/')}
      >
        ≡
      </button>
      <span className={title}>
        {isMapView ? (
          (pageTitle ?? '지도')
        ) : (
          <>
            마<span className={titleAccent}>실</span>
          </>
        )}
      </span>
      {ready && session ? (
        <button
          type="button"
          className={profileBtn}
          onClick={() => router.push(tabHref('my'))}
        >
          {(session.user.email ?? '나').slice(0, 1).toUpperCase()}
        </button>
      ) : (
        <Link href="/login" className={profileBtn}>
          인
        </Link>
      )}
    </div>
  );
}
