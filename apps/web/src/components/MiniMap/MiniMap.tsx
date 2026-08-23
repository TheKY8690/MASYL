'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useKakaoMap, type MapMarkerData } from '../../hooks/useKakaoMap';
import { useKakaoPlaces } from '../../hooks/useKakaoPlaces';
import type { DiscountMapMarker } from '../MapPanel/MapPanel';
import { container, mapContainer, overlay, overlayHint } from './MiniMap.css';

const CENTER_LAT = 37.5172;
const CENTER_LNG = 127.0473;

interface MiniMapProps {
  onSelectCafe?: (cafeId: string) => void;
  discountMarker?: DiscountMapMarker | null;
}

export function MiniMap({ onSelectCafe, discountMarker }: MiniMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const discountOverlayRef = useRef<kakao.maps.CustomOverlay | null>(null);
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
        })),
    [places, discountMarker],
  );

  const mapRef = useKakaoMap(containerRef, {
    centerLat: userLocation?.lat ?? CENTER_LAT,
    centerLng: userLocation?.lng ?? CENTER_LNG,
    level: 4,
    draggable: false,
    scrollwheel: false,
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
      img.width = 60;
      img.height = 60;
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
    };
    tryApply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discountMarker]);

  return (
    <div className={container} onClick={() => onSelectCafe?.('')}>
      <div ref={containerRef} className={mapContainer} />
      <div className={overlay}>
        <span className={overlayHint}>지도에서 더 보기 →</span>
      </div>
    </div>
  );
}
