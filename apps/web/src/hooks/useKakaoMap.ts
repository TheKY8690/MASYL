'use client';

import { useEffect, useRef } from 'react';

export interface MapMarkerData {
  cafeId: string;
  lat: number;
  lng: number;
  price: number;
  hot?: boolean;
  selected?: boolean;
  onClick?: (cafeId: string) => void;
}

interface UseKakaoMapOptions {
  centerLat: number;
  centerLng: number;
  level: number;
  draggable?: boolean;
  scrollwheel?: boolean;
  markers?: MapMarkerData[];
  userLocation?: { lat: number; lng: number };
}

function buildMarkerEl(marker: MapMarkerData): HTMLButtonElement {
  const el = document.createElement('button');

  const baseStyle = [
    'display:flex',
    'align-items:center',
    'gap:4px',
    'padding:6px 10px',
    'border-radius:999px',
    'font-size:12px',
    'font-weight:700',
    'cursor:pointer',
    'border:none',
    'white-space:nowrap',
    'box-shadow:0 2px 8px rgba(0,0,0,0.18)',
    'font-family:inherit',
    'transition:transform 150ms ease',
  ].join(';');

  const colorStyle = marker.selected
    ? 'background:#1A1A2E;color:#fff'
    : marker.hot
      ? 'background:#E74C3C;color:#fff'
      : 'background:#fff;color:#1A1A2E';

  el.style.cssText = `${baseStyle};${colorStyle}`;

  if (marker.hot && !marker.selected) {
    const chip = document.createElement('span');
    chip.style.cssText =
      'padding:1px 5px;border-radius:999px;background:#E74C3C;color:#fff;font-size:10px;font-weight:700';
    chip.textContent = 'HOT';
    el.appendChild(chip);
  }

  el.appendChild(document.createTextNode(`${marker.price.toLocaleString()}원`));

  if (marker.onClick) {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      marker.onClick!(marker.cafeId);
    });
  }

  return el;
}

export function useKakaoMap(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: UseKakaoMapOptions,
) {
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);
  const userOverlayRef = useRef<kakao.maps.CustomOverlay | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current) return;

    const init = () => {
      if (!containerRef.current) return;
      const center = new window.kakao.maps.LatLng(
        options.centerLat,
        options.centerLng,
      );
      mapRef.current = new window.kakao.maps.Map(containerRef.current, {
        center,
        level: options.level,
        draggable: options.draggable ?? true,
        scrollwheel: options.scrollwheel ?? true,
      });
    };

    let retries = 0;
    const tryInit = () => {
      if (window.kakao?.maps) {
        window.kakao.maps.load(init);
      } else if (retries < 20) {
        retries++;
        setTimeout(tryInit, 100);
      }
    };
    tryInit();

    return () => {
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef]);

  // Sync user location marker whenever userLocation changes
  useEffect(() => {
    if (!options.userLocation) return;

    const { lat, lng } = options.userLocation;

    const applyUserMarker = () => {
      if (!mapRef.current) return false;

      if (userOverlayRef.current) {
        userOverlayRef.current.setMap(null);
      }

      const el = document.createElement('div');
      el.style.cssText = [
        'width:18px',
        'height:18px',
        'border-radius:50%',
        'background:#4285F4',
        'border:3px solid #fff',
        'box-shadow:0 2px 8px rgba(66,133,244,0.6)',
        'transform:translate(-50%,-50%)',
      ].join(';');

      userOverlayRef.current = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(lat, lng),
        content: el,
        zIndex: 20,
      });
      userOverlayRef.current.setMap(mapRef.current);
      mapRef.current.setCenter(new window.kakao.maps.LatLng(lat, lng));
      return true;
    };

    // Map might still be initializing — retry until ready
    let retries = 0;
    const tryApply = () => {
      if (!applyUserMarker() && retries < 30) {
        retries++;
        setTimeout(tryApply, 100);
      }
    };
    tryApply();
  }, [options.userLocation]);

  // Sync markers whenever markers array changes
  useEffect(() => {
    if (!mapRef.current) return;

    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];

    const markers = options.markers ?? [];
    markers.forEach((marker) => {
      const position = new window.kakao.maps.LatLng(marker.lat, marker.lng);
      const content = buildMarkerEl(marker);

      const overlay = new window.kakao.maps.CustomOverlay({
        position,
        content,
        zIndex: marker.selected ? 10 : 5,
        clickable: true,
      });

      overlay.setMap(mapRef.current!);
      overlaysRef.current.push(overlay);
    });
  }, [options.markers]);

  return mapRef;
}
