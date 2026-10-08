'use client';

import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '../../lib/supabase';
import { useSession } from '../../hooks/useSession';
import { becomeSeller, getMe } from '../../services/auth.service';
import { getMyCafes } from '../../services/cafe.service';
import { getMyReports } from '../../services/report.service';
import { ReportForm } from '../ReportForm/ReportForm';
import { SellerRegisterForm } from '../SellerRegisterForm/SellerRegisterForm';
import type { DiscountGroup } from '../DiscountCard/DiscountCard';
import { panel, heading, ghost } from './MyPanel.css';

export function MyPanel({ groups }: { groups: DiscountGroup[] }) {
  const { session, token, ready } = useSession();
  const qc = useQueryClient();
  const reportsQuery = useQuery({
    queryKey: ['reports', 'me'],
    queryFn: () => getMyReports(token!),
    enabled: Boolean(token),
  });
  const profileQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => getMe(token!),
    enabled: Boolean(token),
  });
  const cafesQuery = useQuery({
    queryKey: ['cafes', 'mine'],
    queryFn: () => getMyCafes(token!),
    enabled: Boolean(token) && profileQuery.data?.role !== 'user',
  });
  const canSell =
    profileQuery.data?.role === 'seller' || profileQuery.data?.role === 'admin';

  if (!ready) return <div className={panel}>불러오는 중...</div>;

  if (!session || !token) {
    return (
      <div className={panel}>
        <h2 className={heading}>마이</h2>
        <p>로그인하면 제보와 내 정보를 볼 수 있어요.</p>
        <Link href="/login">로그인</Link>
      </div>
    );
  }

  return (
    <div className={panel}>
      <h2 className={heading}>마이</h2>
      <p>{session.user.email}</p>
      <p>권한: {profileQuery.data?.role ?? '...'}</p>
      {profileQuery.data?.role === 'user' && (
        <button
          className={ghost}
          type="button"
          onClick={() =>
            void becomeSeller(token).then(() =>
              qc.invalidateQueries({ queryKey: ['auth', 'me'] }),
            )
          }
        >
          카페 판매자로 등록
        </button>
      )}
      {canSell && (
        <>
          <h3 className={heading}>판매자 할인 등록</h3>
          <SellerRegisterForm
            token={token}
            cafes={cafesQuery.data ?? []}
            onDone={() => {
              void qc.invalidateQueries({ queryKey: ['cafes', 'mine'] });
              void qc.invalidateQueries({ queryKey: ['discounts'] });
            }}
          />
        </>
      )}
      <h3 className={heading}>할인 제보</h3>
      <ReportForm
        token={token}
        groups={groups}
        onDone={() =>
          void qc.invalidateQueries({ queryKey: ['reports', 'me'] })
        }
      />
      <ul>
        {(reportsQuery.data ?? []).map((r) => (
          <li key={r.id}>
            [{r.status}] {r.content}
          </li>
        ))}
      </ul>
      <button
        className={ghost}
        type="button"
        onClick={() => void createClient().auth.signOut()}
      >
        로그아웃
      </button>
    </div>
  );
}
