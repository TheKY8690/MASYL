'use client';

import { useEffect, useRef, useState } from 'react';
import type { CafeCardData } from '../CafeCard/CafeCard';
import { useKakaoMap, type MapMarkerData } from '../../hooks/useKakaoMap';
import {
  panel,
  mapContainer,
  locationBtn,
  selectedPanel,
  selectedName,
  selectedMeta,
  selectedPrice,
  bestCatchBadge,
  catchBtn,
} from './MapPanel.css';

// 강남구 중심 좌표 (mock — 추후 사용자 위치로 교체)
const CENTER_LAT = 37.5172;
const CENTER_LNG = 127.0473;

const MOCK_MARKERS: Omit<MapMarkerData, 'onClick' | 'selected'>[] = [
  { cafeId: '1', lat: 37.5185, lng: 127.0458, price: 1000, hot: true },
  { cafeId: '2', lat: 37.516, lng: 127.049, price: 1200 },
  { cafeId: '3', lat: 37.5155, lng: 127.0445, price: 900 },
];

interface MapPanelProps {
  selectedCafe?: CafeCardData | null;
  onSelectCafe?: (cafeId: string) => void;
}

export function MapPanel({ selectedCafe, onSelectCafe }: MapPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

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

  const markers: MapMarkerData[] = MOCK_MARKERS.map((m) => ({
    ...m,
    selected: selectedCafe?.id === m.cafeId,
    onClick: onSelectCafe,
  }));

  const mapRef = useKakaoMap(containerRef, {
    centerLat: userLocation?.lat ?? CENTER_LAT,
    centerLng: userLocation?.lng ?? CENTER_LNG,
    level: 4,
    markers,
    userLocation: userLocation ?? undefined,
  });

  const handleLocationClick = () => {
    if (!mapRef.current) return;
    const lat = userLocation?.lat ?? CENTER_LAT;
    const lng = userLocation?.lng ?? CENTER_LNG;
    mapRef.current.setCenter(new window.kakao.maps.LatLng(lat, lng));
  };

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

      {selectedCafe && (
        <div className={selectedPanel}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              backgroundColor: selectedCafe.logoColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {selectedCafe.name.slice(0, 2)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className={selectedName}>{selectedCafe.name}</div>
            <div className={selectedMeta}>
              {selectedCafe.distance}m · 도보{' '}
              {Math.ceil(selectedCafe.distance / 80)}분
            </div>
            <div className={selectedPrice}>
              {selectedCafe.item} {selectedCafe.priceValue.toLocaleString()}원{' '}
              <span
                style={{
                  fontSize: 12,
                  color: '#999',
                  textDecoration: 'line-through',
                }}
              >
                {selectedCafe.originalPriceValue.toLocaleString()}원
              </span>
            </div>
          </div>
          <span className={bestCatchBadge}>BEST CATCH</span>
          <button className={catchBtn}>잡기</button>
        </div>
      )}
    </div>
  );
}
