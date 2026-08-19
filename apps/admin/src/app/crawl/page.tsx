'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { useSession } from '../../hooks/useSession';

type CrawlStatus = 'all' | 'pending' | 'processed' | 'failed';

interface CrawledEvent {
  id: string;
  cafeId: string;
  sourceUrl: string;
  status: 'pending' | 'processed' | 'failed';
  summary: string | null;
  processedAt: string | null;
  collectedAt: string;
  discountId: string | null;
}

interface TriggerResult {
  processed: number;
  failed: number;
}

export default function CrawlPage() {
  const router = useRouter();
  const { token } = useSession();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<CrawlStatus>('all');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (token === null) {
      // session 초기화 전에는 null — 잠시 대기
    }
  }, [token]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const params = filter !== 'all' ? `?status=${filter}&limit=50` : '?limit=50';

  const { data: events, isLoading } = useQuery({
    queryKey: ['crawled-events', filter],
    queryFn: () =>
      apiFetch<CrawledEvent[]>(`/crawled-events${params}`, {
        ...(token ? { token } : {}),
      }),
    enabled: !!token,
  });

  const triggerMutation = useMutation({
    mutationFn: () =>
      apiFetch<TriggerResult>('/crawled-events/trigger', {
        method: 'POST',
        ...(token ? { token } : {}),
      }),
    onSuccess: (result) => {
      showToast(
        `크롤링 완료: 처리 ${result.processed}개, 실패 ${result.failed}개`,
      );
      void qc.invalidateQueries({ queryKey: ['crawled-events'] });
    },
    onError: () => showToast('크롤링 실패. 로그 확인 요망.'),
  });

  const reprocessMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/crawled-events/${id}/reprocess`, {
        method: 'PATCH',
        ...(token ? { token } : {}),
      }),
    onSuccess: () => {
      showToast('재처리 완료');
      void qc.invalidateQueries({ queryKey: ['crawled-events'] });
    },
    onError: () => showToast('재처리 실패'),
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

  const tabs: { key: CrawlStatus; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'pending', label: '대기중' },
    { key: 'processed', label: '완료' },
    { key: 'failed', label: '실패' },
  ];

  const statusColor: Record<string, string> = {
    pending: '#f59e0b',
    processed: '#10b981',
    failed: '#ef4444',
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

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>크롤링 관리</h1>
        <button
          onClick={() => triggerMutation.mutate()}
          disabled={triggerMutation.isPending}
          style={{
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 24px',
            fontWeight: 600,
            cursor: triggerMutation.isPending ? 'wait' : 'pointer',
            opacity: triggerMutation.isPending ? 0.7 : 1,
          }}
        >
          {triggerMutation.isPending ? '실행 중...' : '크롤링 실행'}
        </button>
      </div>

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

      {/* 테이블 */}
      {isLoading ? (
        <p style={{ color: '#6b7280' }}>불러오는 중...</p>
      ) : !events?.length ? (
        <p style={{ color: '#6b7280' }}>데이터 없음</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}
          >
            <thead>
              <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                {['소스 URL', '상태', '요약', '수집시각', '처리시각', ''].map(
                  (h) => (
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
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td
                    style={{
                      padding: '10px 12px',
                      maxWidth: 220,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <a
                      href={ev.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#6366f1' }}
                    >
                      {ev.sourceUrl}
                    </a>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span
                      style={{
                        background: statusColor[ev.status] + '22',
                        color: statusColor[ev.status],
                        padding: '2px 10px',
                        borderRadius: 99,
                        fontWeight: 600,
                        fontSize: 12,
                      }}
                    >
                      {ev.status}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '10px 12px',
                      color: '#6b7280',
                      maxWidth: 240,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {ev.summary ?? '—'}
                  </td>
                  <td
                    style={{
                      padding: '10px 12px',
                      color: '#6b7280',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {new Date(ev.collectedAt).toLocaleString('ko-KR')}
                  </td>
                  <td
                    style={{
                      padding: '10px 12px',
                      color: '#6b7280',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {ev.processedAt
                      ? new Date(ev.processedAt).toLocaleString('ko-KR')
                      : '—'}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {ev.status === 'failed' && (
                      <button
                        onClick={() => reprocessMutation.mutate(ev.id)}
                        disabled={reprocessMutation.isPending}
                        style={{
                          background: '#fef3c7',
                          color: '#92400e',
                          border: 'none',
                          borderRadius: 6,
                          padding: '4px 12px',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        재처리
                      </button>
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
