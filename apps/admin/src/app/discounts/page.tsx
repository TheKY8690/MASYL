'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { useSession } from '../../hooks/useSession';

type StatusFilter = 'pending_review' | 'active' | 'rejected';

interface Discount {
  id: string;
  cafeId: string;
  title: string;
  description: string | null;
  discountType: 'percent' | 'amount' | 'free_item' | 'other';
  discountValue: string;
  status: 'active' | 'expired' | 'pending_review' | 'rejected';
  sourceType: 'auto_crawl' | 'user_report' | 'seller_registered';
  validFrom: string | null;
  validUntil: string | null;
  createdAt: string;
}

export default function DiscountsPage() {
  const router = useRouter();
  const { token } = useSession();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<StatusFilter>('pending_review');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const { data: discounts, isLoading } = useQuery({
    queryKey: ['discounts', filter],
    queryFn: () =>
      apiFetch<Discount[]>('/discounts', { ...(token ? { token } : {}) }),
    enabled: !!token,
    select: (data) => {
      const filtered = data.filter((d) => d.status === filter);
      if (filter === 'active') {
        return filtered.sort((a, b) => {
          if (!a.validUntil && !b.validUntil) return 0;
          if (!a.validUntil) return 1;
          if (!b.validUntil) return -1;
          return (
            new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime()
          );
        });
      }
      return filtered;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/discounts/${id}/approve`, {
        method: 'PATCH',
        ...(token ? { token } : {}),
      }),
    onSuccess: () => {
      showToast('승인 완료');
      void qc.invalidateQueries({ queryKey: ['discounts'] });
    },
    onError: () => showToast('승인 실패'),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/discounts/${id}/reject`, {
        method: 'PATCH',
        ...(token ? { token } : {}),
      }),
    onSuccess: () => {
      showToast('거절 완료');
      void qc.invalidateQueries({ queryKey: ['discounts'] });
    },
    onError: () => showToast('거절 실패'),
  });

  if (!token) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        로그인이 필요합니다.{' '}
        <button
          onClick={() => router.push('/login')}
          style={{
            color: '#6366f1',
            textDecoration: 'underline',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          로그인
        </button>
      </div>
    );
  }

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: 'pending_review', label: '승인 대기' },
    { key: 'active', label: '활성' },
    { key: 'rejected', label: '거절됨' },
  ];

  const getEventStatusBadge = (validUntil: string | null) => {
    if (!validUntil)
      return { label: '무기한', bg: '#e5e7eb', color: '#6b7280' };
    const now = new Date();
    const until = new Date(validUntil);
    const daysLeft = Math.ceil(
      (until.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysLeft <= 7)
      return {
        label: `마감임박 (D-${daysLeft})`,
        bg: '#fef3c7',
        color: '#b45309',
      };
    return { label: '진행중', bg: '#dcfce7', color: '#15803d' };
  };

  const discountTypeLabel: Record<string, string> = {
    percent: '% 할인',
    amount: '금액 할인',
    free_item: '무료 제공',
    other: '기타',
  };

  const sourceLabel: Record<string, string> = {
    auto_crawl: '자동수집',
    user_report: '사용자 제보',
    seller_registered: '판매자 등록',
  };

  return (
    <main style={{ padding: '24px 32px' }}>
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 80,
            right: 24,
            background: '#1e1e2e',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 8,
            zIndex: 9999,
            fontSize: 14,
          }}
        >
          {toast}
        </div>
      )}

      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
        할인 관리
      </h1>

      {/* 탭 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            style={{
              padding: '6px 16px',
              borderRadius: 6,
              border: 'none',
              background: filter === t.key ? '#6366f1' : '#e5e7eb',
              color: filter === t.key ? '#fff' : '#374151',
              fontWeight: filter === t.key ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p style={{ color: '#6b7280' }}>불러오는 중...</p>
      ) : !discounts?.length ? (
        <p style={{ color: '#6b7280' }}>데이터 없음</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}
          >
            <thead>
              <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                {[
                  '이벤트명',
                  '유형',
                  '할인값',
                  '출처',
                  ...(filter === 'active' ? ['상태'] : []),
                  '유효기간',
                  '등록일',
                  '',
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 12px',
                      borderBottom: '1px solid #e5e7eb',
                      fontWeight: 600,
                      color: '#374151',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {discounts.map((d) => (
                <tr key={d.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 12px', maxWidth: 200 }}>
                    <div style={{ fontWeight: 600 }}>{d.title}</div>
                    {d.description && (
                      <div
                        style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}
                      >
                        {d.description.slice(0, 60)}
                        {d.description.length > 60 ? '...' : ''}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                    {discountTypeLabel[d.discountType]}
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                    {d.discountValue}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span
                      style={{
                        background:
                          d.sourceType === 'auto_crawl' ? '#ede9fe' : '#dcfce7',
                        color:
                          d.sourceType === 'auto_crawl' ? '#7c3aed' : '#15803d',
                        padding: '2px 8px',
                        borderRadius: 99,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {sourceLabel[d.sourceType]}
                    </span>
                  </td>
                  {filter === 'active' &&
                    (() => {
                      const badge = getEventStatusBadge(d.validUntil);
                      return (
                        <td
                          style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}
                        >
                          <span
                            style={{
                              background: badge.bg,
                              color: badge.color,
                              padding: '2px 8px',
                              borderRadius: 99,
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            {badge.label}
                          </span>
                        </td>
                      );
                    })()}
                  <td
                    style={{
                      padding: '10px 12px',
                      color: '#6b7280',
                      whiteSpace: 'nowrap',
                      fontSize: 12,
                    }}
                  >
                    {d.validFrom
                      ? new Date(d.validFrom).toLocaleDateString('ko-KR')
                      : '—'}{' '}
                    ~{' '}
                    {d.validUntil
                      ? new Date(d.validUntil).toLocaleDateString('ko-KR')
                      : '무기한'}
                  </td>
                  <td
                    style={{
                      padding: '10px 12px',
                      color: '#6b7280',
                      whiteSpace: 'nowrap',
                      fontSize: 12,
                    }}
                  >
                    {new Date(d.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {d.status === 'pending_review' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => approveMutation.mutate(d.id)}
                          disabled={approveMutation.isPending}
                          style={{
                            background: '#dcfce7',
                            color: '#15803d',
                            border: 'none',
                            borderRadius: 6,
                            padding: '4px 12px',
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          승인
                        </button>
                        <button
                          onClick={() => rejectMutation.mutate(d.id)}
                          disabled={rejectMutation.isPending}
                          style={{
                            background: '#fee2e2',
                            color: '#b91c1c',
                            border: 'none',
                            borderRadius: 6,
                            padding: '4px 12px',
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          거절
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
