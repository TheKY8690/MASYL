'use client';

import { useState } from 'react';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
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
  emptyState,
} from './page.css';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'home' | 'map'>('home');
  const locationName = useCurrentLocation();

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
          <LocationBar location={locationName} />
          <SearchStatusPill message="아이스 아메리카노 특가 찾는 중" />

          <div className={sectionHeader}>
            <div>
              <div className={sectionTitle}>오늘의 할인</div>
              <div className={sectionSub}>내 주변 500m 기준</div>
            </div>
            <button className={filterBtn}>☰ 필터</button>
          </div>

          <div className={emptyState}>할인이 존재하지 않습니다.</div>
        </div>

        <MapPanel selectedCafe={null} onSelectCafe={() => {}} />
      </main>

      {/* Mobile home tab — hidden on desktop via CSS */}
      {activeTab === 'home' && (
        <div className={mobileHomeView}>
          <LocationBar location={locationName} />
          <SearchStatusPill message="아이스 아메리카노 특가 찾는 중" />
          <MiniMap
            onSelectCafe={() => {
              setActiveTab('map');
            }}
          />

          <div className={sectionHeader}>
            <div>
              <div className={sectionTitle}>오늘의 할인</div>
              <div className={sectionSub}>내 주변 500m 기준</div>
            </div>
            <button className={filterBtn}>☰ 필터</button>
          </div>

          <div className={emptyState}>할인이 존재하지 않습니다.</div>
        </div>
      )}

      {/* Mobile map tab — hidden on desktop via CSS */}
      {activeTab === 'map' && (
        <div className={mobileMapView}>
          <MapPanel selectedCafe={null} onSelectCafe={() => {}} />
        </div>
      )}

      {/* Bottom nav — hidden on desktop via CSS */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  );
}
