'use client';

import { useEffect, useRef, useState } from 'react';
import { useKakaoMap, type MapMarkerData } from '../../hooks/useKakaoMap';
import { container, mapContainer, overlay, overlayHint } from './MiniMap.css';

const CENTER_LAT = 37.5172;
const CENTER_LNG = 127.0473;

const MINI_MARKERS: Omit<MapMarkerData, 'onClick' | 'selected'>[] = [
  { cafeId: '1', lat: 37.5185, lng: 127.0458, price: 1000, hot: true },
  { cafeId: '2', lat: 37.516, lng: 127.049, price: 1200 },
  { cafeId: '3', lat: 37.5155, lng: 127.0445, price: 900 },
];

interface MiniMapProps {
  onSelectCafe?: (cafeId: string) => void;
}

export function MiniMap({ onSelectCafe }: MiniMapProps) {
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

  const markers: MapMarkerData[] = MINI_MARKERS.map((m) => ({
    ...m,
    onClick: onSelectCafe,
  }));

  useKakaoMap(containerRef, {
    centerLat: userLocation?.lat ?? CENTER_LAT,
    centerLng: userLocation?.lng ?? CENTER_LNG,
    level: 5,
    draggable: false,
    scrollwheel: false,
    markers,
    userLocation: userLocation ?? undefined,
  });

  return (
    <div className={container} onClick={() => onSelectCafe?.('')}>
      <div ref={containerRef} className={mapContainer} />
      <div className={overlay}>
        <span className={overlayHint}>지도에서 더 보기 →</span>
      </div>
    </div>
  );
}
