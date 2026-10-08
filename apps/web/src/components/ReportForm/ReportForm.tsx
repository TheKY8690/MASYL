'use client';

import { useState } from 'react';
import { createReport } from '../../services/report.service';
import type { DiscountGroup } from '../DiscountCard/DiscountCard';
import { form, label, select, textarea, submit } from './ReportForm.css';

export function ReportForm({
  token,
  groups,
  onDone,
}: {
  token: string;
  groups: DiscountGroup[];
  onDone: () => void;
}) {
  const cafes = groups.filter((g) => g.discounts[0]?.cafeId);
  const [cafeId, setCafeId] = useState(cafes[0]?.discounts[0]?.cafeId ?? '');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submitForm = async () => {
    if (!cafeId || !content.trim()) {
      setError('카페와 내용을 입력하세요');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await createReport(token, { cafeId, content: content.trim() });
      setContent('');
      onDone();
    } catch {
      setError('제보에 실패했어요. 로그인과 카페 정보를 확인하세요');
    } finally {
      setBusy(false);
    }
  };

  if (cafes.length === 0) {
    return <p>주변에 제보할 카페가 없어요. 위치가 잡힌 뒤 다시 시도하세요.</p>;
  }

  return (
    <div className={form}>
      <label className={label}>
        카페
        <select
          className={select}
          value={cafeId}
          onChange={(e) => setCafeId(e.target.value)}
        >
          {cafes.map((g) => (
            <option key={g.key} value={g.discounts[0]!.cafeId!}>
              {g.displayName}
            </option>
          ))}
        </select>
      </label>
      <label className={label}>
        할인 내용
        <textarea
          className={textarea}
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="예: 아메리카노 1+1, 오늘까지"
        />
      </label>
      {error && <p>{error}</p>}
      <button
        className={submit}
        type="button"
        disabled={busy}
        onClick={() => void submitForm()}
      >
        제보하기
      </button>
    </div>
  );
}
