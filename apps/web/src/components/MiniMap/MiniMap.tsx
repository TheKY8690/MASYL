'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useKakaoMap, type MapMarkerData } from '../../hooks/useKakaoMap';
import { useKakaoPlaces } from '../../hooks/useKakaoPlaces';
import { container, mapContainer, overlay, overlayHint } from './MiniMap.css';

const CENTER_LAT = 37.5172;
const CENTER_LNG = 127.0473;

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

  const places = useKakaoPlaces({
    lat: userLocation?.lat,
    lng: userLocation?.lng,
    radius: 500,
  });

  const markers = useMemo<MapMarkerData[]>(
    () =>
      places.map((p) => ({
        cafeId: p.id,
        lat: parseFloat(p.y),
        lng: parseFloat(p.x),
        name: p.place_name,
      })),
    [places],
  );

  useKakaoMap(containerRef, {
    centerLat: userLocation?.lat ?? CENTER_LAT,
    centerLng: userLocation?.lng ?? CENTER_LNG,
    level: 4,
    draggable: false,
    scrollwheel: false,
    markers,
    ...(userLocation ? { userLocation } : {}),
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
