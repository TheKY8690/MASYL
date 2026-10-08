'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { useNearbyDiscounts } from '../hooks/useNearbyDiscounts';
import { useKakaoPlaces } from '../hooks/useKakaoPlaces';
import { MapPanel } from '../components/MapPanel/MapPanel';
import type { DiscountMapMarker } from '../components/MapPanel/MapPanel';
import { MiniMap } from '../components/MiniMap/MiniMap';
import { LocationBar } from '../components/LocationBar/LocationBar';
import { SearchStatusPill } from '../components/SearchStatusPill/SearchStatusPill';
import { MobileHeader } from '../components/MobileHeader/MobileHeader';
import { BottomNav, type Tab } from '../components/BottomNav/BottomNav';
import { BenefitsPanel } from '../components/BenefitsPanel/BenefitsPanel';
import { MyPanel } from '../components/MyPanel/MyPanel';
import { parseAppTab, tabHref } from '../lib/tabs';
import {
  DiscountCard,
  type DiscountGroup,
} from '../components/DiscountCard/DiscountCard';
import {
  layout,
  leftPanel,
  mobileHomeView,
  mobileMapView,
  desktopPanel,
  mobilePanelView,
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

function HomePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = parseAppTab(searchParams.get('tab'));
  const setActiveTab = (tab: Tab) => {
    router.replace(tabHref(tab));
  };
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
              : d.brandName
                ? (() => {
                    const matched = nearbyPlaces.find((p) =>
                      p.place_name.includes(d.brandName!),
                    );
                    return matched?.distance
                      ? parseInt(matched.distance)
                      : undefined;
                  })()
                : undefined,
          cafeLatitude: d.cafeLatitude,
          cafeLongitude: d.cafeLongitude,
          discounts: [],
        });
      }
      map.get(key)!.discounts.push(d);
    }
    return [...map.values()]
      .map((g) => ({
        ...g,
        discounts: [...g.discounts].sort((a, b) => {
          if (!a.validUntil && !b.validUntil) return 0;
          if (!a.validUntil) return 1;
          if (!b.validUntil) return -1;
          return (
            new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime()
          );
        }),
      }))
      .sort((a, b) => {
        if (a.distance == null && b.distance == null) return 0;
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return a.distance - b.distance;
      });
  }, [filteredDiscounts, userLocation, nearbyPlaces]);

  const selectedDiscount =
    filteredDiscounts.find((d) => d.id === selectedDiscountId) ?? null;

  const selectedGroup = selectedDiscountId
    ? (discountGroups.find((g) =>
        g.discounts.some((d) => d.id === selectedDiscountId),
      ) ?? null)
    : null;

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

  const handleSelectCafe = (placeId: string) => {
    const place = nearbyPlaces.find((p) => p.id === placeId);
    if (!place) return;
    const matched = filteredDiscounts.find(
      (d) => d.brandName && place.place_name.includes(d.brandName),
    );
    if (matched) setSelectedDiscountId(matched.id);
  };

  const handleSelectDiscount = (id: string) => {
    if (selectedDiscountId === id) {
      setSelectedDiscountId(null);
      return;
    }
    setSelectedDiscountId(id);
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

  const pageTitle =
    activeTab === 'map'
      ? '지도'
      : activeTab === 'benefits'
        ? '혜택'
        : activeTab === 'my'
          ? '마이'
          : '마실';

  return (
    <>
      <MobileHeader pageTitle={pageTitle} isMapView={activeTab === 'map'} />

      {(activeTab === 'home' || activeTab === 'map') && (
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
            onSelectCafe={handleSelectCafe}
            discountMarker={discountMarker}
            onClearDiscount={() => setSelectedDiscountId(null)}
            selectedGroup={selectedGroup}
            selectedDiscountId={selectedDiscountId}
            onSelectDiscount={handleSelectDiscount}
          />
        </main>
      )}

      {activeTab === 'benefits' && (
        <div className={desktopPanel}>
          <BenefitsPanel />
        </div>
      )}
      {activeTab === 'my' && (
        <div className={desktopPanel}>
          <MyPanel groups={discountGroups} />
        </div>
      )}

      {activeTab === 'home' && (
        <div className={mobileHomeView}>
          <LocationBar location={locationName} />
          <SearchStatusPill message="아이스 아메리카노 특가 찾는 중" />
          <MiniMap
            discountMarker={discountMarker}
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

      {activeTab === 'map' && (
        <div className={mobileMapView}>
          <MapPanel
            selectedCafe={null}
            onSelectCafe={handleSelectCafe}
            discountMarker={discountMarker}
            onClearDiscount={() => setSelectedDiscountId(null)}
            selectedGroup={selectedGroup}
            selectedDiscountId={selectedDiscountId}
            onSelectDiscount={handleSelectDiscount}
          />
        </div>
      )}

      {activeTab === 'benefits' && (
        <div className={mobilePanelView}>
          <BenefitsPanel />
        </div>
      )}
      {activeTab === 'my' && (
        <div className={mobilePanelView}>
          <MyPanel groups={discountGroups} />
        </div>
      )}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageInner />
    </Suspense>
  );
}
