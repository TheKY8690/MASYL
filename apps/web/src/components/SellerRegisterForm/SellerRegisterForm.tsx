'use client';

import { useState } from 'react';
import { createCafe, type CafeRow } from '../../services/cafe.service';
import { createDiscount } from '../../services/discount.service';
import {
  form,
  label,
  select,
  textarea,
  submit,
} from '../ReportForm/ReportForm.css';

export function SellerRegisterForm({
  token,
  cafes,
  onDone,
}: {
  token: string;
  cafes: CafeRow[];
  onDone: () => void;
}) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [phone, setPhone] = useState('');
  const [cafeId, setCafeId] = useState(cafes[0]?.id ?? '');
  const [newCafe, setNewCafe] = useState(cafes.length === 0);
  const [title, setTitle] = useState('');
  const [discountType, setDiscountType] = useState<
    'percent' | 'amount' | 'free_item' | 'other'
  >('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fillLocation = () => {
    if (!navigator.geolocation) {
      setError('이 브라우저에서 위치를 쓸 수 없어요');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(String(pos.coords.latitude));
        setLongitude(String(pos.coords.longitude));
      },
      () => setError('위치를 가져오지 못했어요'),
    );
  };

  const submitForm = async () => {
    if (!title.trim() || !discountValue.trim()) {
      setError('할인 제목과 값을 입력하세요');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      let targetCafeId = cafeId;
      if (newCafe) {
        const lat = Number(latitude);
        const lng = Number(longitude);
        if (
          !name.trim() ||
          !address.trim() ||
          Number.isNaN(lat) ||
          Number.isNaN(lng)
        ) {
          setError('새 카페는 이름, 주소, 위도, 경도가 필요해요');
          setBusy(false);
          return;
        }
        const cafe = await createCafe(token, {
          name: name.trim(),
          address: address.trim(),
          latitude: lat,
          longitude: lng,
          ...(phone.trim() ? { phone: phone.trim() } : {}),
        });
        targetCafeId = cafe.id;
      }
      if (!targetCafeId) {
        setError('카페를 선택하세요');
        setBusy(false);
        return;
      }
      await createDiscount(token, {
        cafeId: targetCafeId,
        title: title.trim(),
        discountType,
        discountValue: discountValue.trim(),
      });
      setTitle('');
      setDiscountValue('');
      onDone();
    } catch {
      setError('등록 실패. 판매자 권한과 입력을 확인하세요');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={form}>
      {cafes.length > 0 && (
        <label className={label}>
          <span>
            <input
              type="checkbox"
              checked={newCafe}
              onChange={(e) => setNewCafe(e.target.checked)}
            />{' '}
            새 카페 등록
          </span>
        </label>
      )}
      {!newCafe && cafes.length > 0 && (
        <label className={label}>
          내 카페
          <select
            className={select}
            value={cafeId}
            onChange={(e) => setCafeId(e.target.value)}
          >
            {cafes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {newCafe && (
        <>
          <label className={label}>
            카페 이름
            <input
              className={select}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className={label}>
            주소
            <input
              className={select}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </label>
          <label className={label}>
            위도
            <input
              className={select}
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
          </label>
          <label className={label}>
            경도
            <input
              className={select}
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </label>
          <button className={submit} type="button" onClick={fillLocation}>
            현재 위치 채우기
          </button>
          <label className={label}>
            전화 (선택)
            <input
              className={select}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
        </>
      )}
      <label className={label}>
        할인 제목
        <input
          className={select}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 아메리카노 20%"
        />
      </label>
      <label className={label}>
        유형
        <select
          className={select}
          value={discountType}
          onChange={(e) =>
            setDiscountType(e.target.value as typeof discountType)
          }
        >
          <option value="percent">퍼센트</option>
          <option value="amount">금액</option>
          <option value="free_item">증정</option>
          <option value="other">기타</option>
        </select>
      </label>
      <label className={label}>
        할인 값
        <textarea
          className={textarea}
          rows={2}
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
          placeholder="예: 20% / 500원 / 아메리카노 1잔"
        />
      </label>
      {error && <p>{error}</p>}
      <button
        className={submit}
        type="button"
        disabled={busy}
        onClick={() => void submitForm()}
      >
        할인 등록
      </button>
    </div>
  );
}
