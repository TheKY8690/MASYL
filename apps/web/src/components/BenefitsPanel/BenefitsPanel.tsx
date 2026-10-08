'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from '../../hooks/useSession';
import { getMyReports } from '../../services/report.service';
import { panel, heading } from '../MyPanel/MyPanel.css';

export function BenefitsPanel() {
  const { token, ready } = useSession();
  const reportsQuery = useQuery({
    queryKey: ['reports', 'me'],
    queryFn: () => getMyReports(token!),
    enabled: Boolean(token),
  });

  if (!ready) return <div className={panel}>불러오는 중...</div>;
  if (!token) {
    return (
      <div className={panel}>
        <h2 className={heading}>혜택</h2>
        <p>로그인한 뒤 제보 처리 상태를 볼 수 있어요.</p>
      </div>
    );
  }

  const approved = (reportsQuery.data ?? []).filter(
    (r) => r.status === 'approved',
  );
  const pending = (reportsQuery.data ?? []).filter(
    (r) => r.status === 'pending',
  );

  return (
    <div className={panel}>
      <h2 className={heading}>혜택</h2>
      <p>
        승인된 제보 {approved.length}건 · 검토 중 {pending.length}건
      </p>
      <ul>
        {approved.map((r) => (
          <li key={r.id}>{r.content}</li>
        ))}
      </ul>
      {approved.length === 0 && <p>아직 승인된 혜택이 없어요.</p>}
    </div>
  );
}
