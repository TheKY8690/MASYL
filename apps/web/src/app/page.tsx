'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { useNearbyDiscounts } from '../hooks/useNearbyDiscounts';
import { useKakaoPlaces } from '../hooks/useKakaoPlaces';
import { MapPanel } from '../components/MapPanel/MapPanel';
import type { DiscountMapMarker } from '../components/MapPanel/MapPanel';
import { MiniMap } from '../components/MiniMap/MiniMap';
import { LocationBar } from '../components/LocationBar/LocationBar';
import { SearchStatusPill } from '../components/SearchStatusPill/SearchStatusPill';
import { MobileHeader } from '../components/MobileHeader/MobileHeader';
import { BottomNav } from '../components/BottomNav/BottomNav';
import {
  DiscountCard,
  type DiscountGroup,
} from '../components/DiscountCard/DiscountCard';
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
  emptyState,
} from './page.css';

function calcDistanceM(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'home' | 'map'>('home');
  const locationName = useCurrentLocation();
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedDiscountId, setSelectedDiscountId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => {},
    );
  }, []);

  const { data: discounts = [] } = useNearbyDiscounts({
    lat: userLocation?.lat,
    lng: userLocation?.lng,
  });

  const nearbyPlaces = useKakaoPlaces({
    lat: userLocation?.lat,
    lng: userLocation?.lng,
    radius: 500,
  });

  const filteredDiscounts = useMemo(() => {
    if (!userLocation) return discounts;
    return discounts.filter((d) => {
      if (d.cafeLatitude && d.cafeLongitude) {
        return (
          calcDistanceM(
            userLocation.lat,
            userLocation.lng,
            parseFloat(d.cafeLatitude),
            parseFloat(d.cafeLongitude),
          ) <= 500
        );
      }
      if (d.brandName) {
        return nearbyPlaces.some((p) => p.place_name.includes(d.brandName!));
      }
      return false;
    });
  }, [discounts, userLocation, nearbyPlaces]);

  const discountGroups = useMemo(() => {
    const map = new Map<string, DiscountGroup>();
    for (const d of filteredDiscounts) {
      const key = d.cafeId ?? d.brandId ?? d.id;
      if (!map.has(key)) {
        map.set(key, {
          key,
          displayName: d.cafeName ?? d.brandName ?? '카페',
          distance:
            userLocation && d.cafeLatitude && d.cafeLongitude
              ? Math.round(
                  calcDistanceM(
                    userLocation.lat,
                    userLocation.lng,
                    parseFloat(d.cafeLatitude),
                    parseFloat(d.cafeLongitude),
                  ),
                )
              : undefined,
          cafeLatitude: d.cafeLatitude,
          cafeLongitude: d.cafeLongitude,
          discounts: [],
        });
      }
      map.get(key)!.discounts.push(d);
    }
    return [...map.values()];
  }, [filteredDiscounts, userLocation]);

  const selectedDiscount =
    filteredDiscounts.find((d) => d.id === selectedDiscountId) ?? null;

  const discountMarker: DiscountMapMarker | null = (() => {
    if (!selectedDiscount) return null;

    if (selectedDiscount.cafeLatitude && selectedDiscount.cafeLongitude) {
      return {
        id: selectedDiscount.id,
        lat: parseFloat(selectedDiscount.cafeLatitude),
        lng: parseFloat(selectedDiscount.cafeLongitude),
        title: selectedDiscount.title,
        discountValue: selectedDiscount.discountValue,
        eventUrl: selectedDiscount.eventUrl,
      };
    }

    if (selectedDiscount.brandName) {
      const matched = nearbyPlaces.find((p) =>
        p.place_name.includes(selectedDiscount.brandName!),
      );
      if (matched) {
        return {
          id: selectedDiscount.id,
          lat: parseFloat(matched.y),
          lng: parseFloat(matched.x),
          title: selectedDiscount.title,
          discountValue: selectedDiscount.discountValue,
          eventUrl: selectedDiscount.eventUrl,
        };
      }
    }

    return null;
  })();

  const handleSelectDiscount = (id: string) => {
    if (selectedDiscountId === id) {
      setSelectedDiscountId(null);
      return;
    }
    setSelectedDiscountId(id);
    if (activeTab === 'home') setActiveTab('map');
  };

  const discountList = (
    <>
      {discountGroups.length === 0 ? (
        <div className={emptyState}>할인이 존재하지 않습니다.</div>
      ) : (
        <div className={cardList}>
          {discountGroups.map((group) => (
            <DiscountCard
              key={group.key}
              group={group}
              selectedDiscountId={selectedDiscountId}
              onSelect={handleSelectDiscount}
            />
          ))}
        </div>
      )}
    </>
  );

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

          {discountList}
        </div>

        <MapPanel
          selectedCafe={null}
          onSelectCafe={() => {}}
          discountMarker={discountMarker}
          onClearDiscount={() => setSelectedDiscountId(null)}
        />
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

          {discountList}
        </div>
      )}

      {/* Mobile map tab — hidden on desktop via CSS */}
      {activeTab === 'map' && (
        <div className={mobileMapView}>
          <MapPanel
            selectedCafe={null}
            onSelectCafe={() => {}}
            discountMarker={discountMarker}
            onClearDiscount={() => setSelectedDiscountId(null)}
          />
        </div>
      )}

      {/* Bottom nav — hidden on desktop via CSS */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  );
}
