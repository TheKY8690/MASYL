'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CafeCardData } from '../CafeCard/CafeCard';
import { useKakaoMap, type MapMarkerData } from '../../hooks/useKakaoMap';
import { useKakaoPlaces, type KakaoPlace } from '../../hooks/useKakaoPlaces';
import {
  panel,
  mapContainer,
  locationBtn,
  selectedPanel,
  selectedName,
  selectedMeta,
  catchBtn,
} from './MapPanel.css';

export interface DiscountMapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  discountValue: string;
  eventUrl?: string | null;
}

interface MapPanelProps {
  selectedCafe?: CafeCardData | null;
  onSelectCafe?: (cafeId: string) => void;
  discountMarker?: DiscountMapMarker | null;
  onClearDiscount?: () => void;
}

export function MapPanel({
  selectedCafe,
  onSelectCafe,
  discountMarker,
  onClearDiscount,
}: MapPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<KakaoPlace | null>(null);
  const discountOverlayRef = useRef<kakao.maps.CustomOverlay | null>(null);

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

  const places = useKakaoPlaces({
    lat: userLocation?.lat,
    lng: userLocation?.lng,
    radius: 1000,
  });

  const handleSelect = useCallback(
    (id: string) => {
      const found = places.find((pl) => pl.id === id) ?? null;
      setSelectedPlace(found);
      if (onSelectCafe) onSelectCafe(id);
    },
    [places, onSelectCafe],
  );

  const markers = useMemo<MapMarkerData[]>(
    () =>
      places
        .filter((p) => {
          if (!discountMarker) return true;
          return !(
            Math.abs(parseFloat(p.y) - discountMarker.lat) < 0.0001 &&
            Math.abs(parseFloat(p.x) - discountMarker.lng) < 0.0001
          );
        })
        .map((p) => ({
          cafeId: p.id,
          lat: parseFloat(p.y),
          lng: parseFloat(p.x),
          name: p.place_name,
          selected: selectedPlace?.id === p.id,
          onClick: handleSelect,
        })),
    [places, selectedPlace?.id, handleSelect, discountMarker],
  );

  const mapRef = useKakaoMap(containerRef, {
    centerLat: userLocation?.lat ?? 37.5172,
    centerLng: userLocation?.lng ?? 127.0473,
    level: 3,
    markers,
    ...(userLocation ? { userLocation } : {}),
  });

  useEffect(() => {
    if (discountOverlayRef.current) {
      discountOverlayRef.current.setMap(null);
      discountOverlayRef.current = null;
    }
    if (!discountMarker) return;

    let retries = 0;
    const tryApply = () => {
      if (!mapRef.current) {
        if (retries++ < 30) setTimeout(tryApply, 100);
        return;
      }
      const img = document.createElement('img');
      img.src = '/마실마커red.png';
      img.width = 80;
      img.height = 80;
      img.style.cssText = 'display:block;mix-blend-mode:multiply;';
      img.alt = discountMarker.title;

      const pos = new window.kakao.maps.LatLng(
        discountMarker.lat,
        discountMarker.lng,
      );
      discountOverlayRef.current = new window.kakao.maps.CustomOverlay({
        position: pos,
        content: img,
        xAnchor: 0.5,
        yAnchor: 1.0,
        zIndex: 30,
      });
      discountOverlayRef.current.setMap(mapRef.current);
      mapRef.current.setCenter(pos);
    };
    tryApply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discountMarker]);

  const handleLocationClick = () => {
    if (!mapRef.current || !userLocation) return;
    mapRef.current.setCenter(
      new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng),
    );
  };

  const activePanel = selectedCafe ?? null;

  return (
    <div className={panel}>
      <div ref={containerRef} className={mapContainer} />

      <button
        className={locationBtn}
        title="내 위치"
        onClick={handleLocationClick}
      >
        ⊕
      </button>

      {/* 할인 카페 선택 패널 (기존) */}
      {activePanel && (
        <div className={selectedPanel}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              backgroundColor: activePanel.logoColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {activePanel.name.slice(0, 2)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className={selectedName}>{activePanel.name}</div>
            <div className={selectedMeta}>
              {activePanel.distance}m · 도보{' '}
              {Math.ceil(activePanel.distance / 80)}분
            </div>
          </div>
          <button className={catchBtn}>잡기</button>
        </div>
      )}

      {/* 할인 이벤트 선택 패널 */}
      {!activePanel && discountMarker && (
        <div className={selectedPanel}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className={selectedName}>{discountMarker.title}</div>
            <div className={selectedMeta}>{discountMarker.discountValue}</div>
          </div>
          {discountMarker.eventUrl && (
            <a
              href={discountMarker.eventUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={catchBtn}
              style={{ textDecoration: 'none' }}
            >
              자세히 보기
            </a>
          )}
          <button
            className={catchBtn}
            onClick={onClearDiscount}
            style={{ background: '#e5e7eb', color: '#374151' }}
          >
            닫기
          </button>
        </div>
      )}

      {/* 카카오 장소검색 카페 선택 패널 */}
      {!activePanel && !discountMarker && selectedPlace && (
        <div className={selectedPanel}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              background: '#6F4E37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {selectedPlace.place_name.slice(0, 2)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className={selectedName}>{selectedPlace.place_name}</div>
            <div className={selectedMeta}>
              {selectedPlace.distance
                ? `${selectedPlace.distance}m`
                : selectedPlace.road_address_name || selectedPlace.address_name}
            </div>
          </div>
          <button
            className={catchBtn}
            onClick={() => setSelectedPlace(null)}
            style={{ background: '#e5e7eb', color: '#374151' }}
          >
            닫기
          </button>
        </div>
      )}
    </div>
  );
}
