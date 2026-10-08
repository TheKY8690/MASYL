import { useMemo, useState } from 'react';
import { DiscountList } from './components/DiscountList';
import { KakaoMapView } from './components/KakaoMapView';
import { useKakaoPlaces } from './hooks/useKakaoPlaces';
import { useNearbyDiscounts } from './hooks/useNearbyDiscounts';
import { useTossLocation } from './hooks/useTossLocation';
import { groupNearbyDiscounts } from './lib/groupDiscounts';
import type { MapMarkerData } from './hooks/useKakaoMap';
import './App.css';

type Tab = 'home' | 'map' | 'benefits' | 'my';

const TABS: { id: Tab; label: string }[] = [
  { id: 'home', label: '홈' },
  { id: 'map', label: '지도' },
  { id: 'benefits', label: '혜택' },
  { id: 'my', label: '마이' },
];

export function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { coords, error, loading } = useTossLocation();
  const { data: discounts = [], isError: discountError } = useNearbyDiscounts({
    lat: coords?.lat,
    lng: coords?.lng,
  });
  const places = useKakaoPlaces({
    lat: coords?.lat,
    lng: coords?.lng,
    radius: 500,
  });

  const groups = useMemo(
    () => groupNearbyDiscounts(discounts, coords, places),
    [discounts, coords, places],
  );

  const markers: MapMarkerData[] = useMemo(() => {
    return groups.flatMap((g) => {
      const lat = g.cafeLatitude ? parseFloat(g.cafeLatitude) : NaN;
      const lng = g.cafeLongitude ? parseFloat(g.cafeLongitude) : NaN;
      if (Number.isNaN(lat) || Number.isNaN(lng)) return [];
      const first = g.discounts[0];
      if (!first) return [];
      return [
        {
          id: first.id,
          lat,
          lng,
          label: first.discountValue,
          selected: g.discounts.some((d) => d.id === selectedId),
          onClick: (id) => setSelectedId(id),
        },
      ];
    });
  }, [groups, selectedId]);

  const locationLabel = loading
    ? '위치 확인 중...'
    : error
      ? error
      : coords
        ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
        : '위치 없음';

  return (
    <div className="shell">
      <header className="top">
        <h1>마실</h1>
        <p className="loc">{locationLabel}</p>
      </header>

      <main className="main">
        {tab === 'home' && (
          <>
            <p className="pill">아이스 아메리카노 특가 찾는 중</p>
            <div className="section-head">
              <div>
                <h2>오늘의 할인</h2>
                <p>내 주변 500m 기준</p>
              </div>
            </div>
            {discountError ? (
              <p className="empty">
                할인 API에 연결하지 못했어요. API가 켜져 있는지 확인하세요.
              </p>
            ) : (
              <DiscountList
                groups={groups}
                selectedId={selectedId}
                onSelect={(id) =>
                  setSelectedId((prev) => (prev === id ? null : id))
                }
              />
            )}
          </>
        )}

        {tab === 'map' && (
          <div className="map-wrap">
            {coords ? (
              <KakaoMapView center={coords} markers={markers} />
            ) : (
              <p className="empty">
                지도에 위치를 표시하려면 위치 권한이 필요해요.
              </p>
            )}
            {!import.meta.env.VITE_KAKAO_MAP_API_KEY && (
              <p className="hint">
                VITE_KAKAO_MAP_API_KEY를 넣으면 카카오맵이 보여요.
              </p>
            )}
          </div>
        )}

        {tab === 'benefits' && (
          <>
            <div className="section-head">
              <div>
                <h2>주변 혜택</h2>
                <p>로그인 없이 할인만 보여요</p>
              </div>
            </div>
            <DiscountList
              groups={groups}
              selectedId={selectedId}
              onSelect={(id) =>
                setSelectedId((prev) => (prev === id ? null : id))
              }
            />
          </>
        )}
        {tab === 'my' && (
          <p className="empty">
            토스 미니앱은 로그인하지 않아요. 제보와 계정은 마실 웹에서 Google
            로그인으로 이용하세요.
          </p>
        )}
      </main>

      <nav className="tabs">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? 'tab active' : 'tab'}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
