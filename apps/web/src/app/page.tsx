'use client';

import { useState } from 'react';
import { CafeCard, type CafeCardData } from '../components/CafeCard/CafeCard';
import { MapPanel } from '../components/MapPanel/MapPanel';
import { MiniMap } from '../components/MiniMap/MiniMap';
import { LocationBar } from '../components/LocationBar/LocationBar';
import { SearchStatusPill } from '../components/SearchStatusPill/SearchStatusPill';
import { MobileHeader } from '../components/MobileHeader/MobileHeader';
import { BottomNav } from '../components/BottomNav/BottomNav';
import {
  layout,
  leftPanel,
  mobileHomeView,
  mobileMapView,
  sectionHeader,
  sectionTitle,
  sectionSub,
  filterBtn,
  cardList,
} from './page.css';

const MOCK_CAFES: CafeCardData[] = [
  {
    id: '1',
    name: '메가커피',
    distance: 250,
    item: '아이스 아메리카노',
    priceValue: 1000,
    originalPriceValue: 1500,
    badge: 'active',
    logoColor: '#FF6B35',
  },
  {
    id: '2',
    name: '컴포즈커피',
    distance: 180,
    item: '아이스라떼',
    priceValue: 1200,
    originalPriceValue: 2000,
    badge: 'quick',
    logoColor: '#2D5A8E',
  },
  {
    id: '3',
    name: '빽다방',
    distance: 420,
    item: '달콤아메리카노',
    priceValue: 900,
    originalPriceValue: 1500,
    badge: 'hot',
    logoColor: '#E74C3C',
  },
];

export default function HomePage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'map'>('home');

  const selectedCafe = MOCK_CAFES.find((c) => c.id === selectedId) ?? null;

  const handleSelectCafe = (id: string) =>
    setSelectedId((prev) => (prev === id ? null : id));

  return (
    <>
      {/* Mobile header — hidden on desktop via CSS */}
      <MobileHeader
        pageTitle={activeTab === 'map' ? '지도' : '마실'}
        isMapView={activeTab === 'map'}
      />

      {/* Desktop 2-panel — hidden on mobile via CSS */}
      <main className={layout}>
        <div className={leftPanel}>
          <LocationBar location="서울시 강남구" />
          <SearchStatusPill message="아이스 아메리카노 특가 찾는 중" />

          <div className={sectionHeader}>
            <div>
              <div className={sectionTitle}>오늘의 캐치</div>
              <div className={sectionSub}>내 주변 500m 기준</div>
            </div>
            <button className={filterBtn}>☰ 필터</button>
          </div>

          <div className={cardList}>
            {MOCK_CAFES.map((cafe) => (
              <CafeCard
                key={cafe.id}
                data={cafe}
                selected={selectedId === cafe.id}
                onClick={() => handleSelectCafe(cafe.id)}
              />
            ))}
          </div>
        </div>

        <MapPanel selectedCafe={selectedCafe} onSelectCafe={handleSelectCafe} />
      </main>

      {/* Mobile home tab — hidden on desktop via CSS */}
      {activeTab === 'home' && (
        <div className={mobileHomeView}>
          <LocationBar location="서울시 강남구" />
          <SearchStatusPill message="아이스 아메리카노 특가 찾는 중" />
          <MiniMap
            onSelectCafe={(id) => {
              if (id) handleSelectCafe(id);
              setActiveTab('map');
            }}
          />

          <div className={sectionHeader}>
            <div>
              <div className={sectionTitle}>오늘의 캐치</div>
              <div className={sectionSub}>내 주변 500m 기준</div>
            </div>
            <button className={filterBtn}>☰ 필터</button>
          </div>

          <div className={cardList}>
            {MOCK_CAFES.map((cafe) => (
              <CafeCard
                key={cafe.id}
                data={cafe}
                selected={selectedId === cafe.id}
                onClick={() => handleSelectCafe(cafe.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Mobile map tab — hidden on desktop via CSS */}
      {activeTab === 'map' && (
        <div className={mobileMapView}>
          <MapPanel
            selectedCafe={selectedCafe}
            onSelectCafe={handleSelectCafe}
          />
        </div>
      )}

      {/* Bottom nav — hidden on desktop via CSS */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  );
}
