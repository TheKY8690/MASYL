import { useEffect, useRef, useState } from 'react';

export interface MapMarkerData {
  id: string;
  lat: number;
  lng: number;
  label: string;
  selected?: boolean;
  onClick?: (id: string) => void;
}

export function useKakaoMap(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: {
    centerLat: number;
    centerLng: number;
    level: number;
    markers?: MapMarkerData[];
    userLocation?: { lat: number; lng: number } | null;
  },
) {
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);
  const userOverlayRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const init = () => {
      if (!containerRef.current) return;
      mapRef.current = new window.kakao.maps.Map(containerRef.current, {
        center: new window.kakao.maps.LatLng(
          options.centerLat,
          options.centerLng,
        ),
        level: options.level,
      });
      setMapReady(true);
    };

    let retries = 0;
    const tryInit = () => {
      if (window.kakao?.maps) {
        window.kakao.maps.load(init);
      } else if (retries < 20) {
        retries += 1;
        setTimeout(tryInit, 100);
      }
    };
    tryInit();

    return () => {
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef]);

  useEffect(() => {
    if (!options.userLocation || !mapRef.current) return;
    const { lat, lng } = options.userLocation;
    if (userOverlayRef.current) userOverlayRef.current.setMap(null);
    const el = document.createElement('div');
    el.style.cssText =
      'width:18px;height:18px;border-radius:50%;background:#3182F6;border:3px solid #fff;box-shadow:0 2px 8px rgba(49,130,246,0.5);transform:translate(-50%,-50%)';
    userOverlayRef.current = new window.kakao.maps.CustomOverlay({
      position: new window.kakao.maps.LatLng(lat, lng),
      content: el,
      zIndex: 20,
    });
    userOverlayRef.current.setMap(mapRef.current);
    mapRef.current.setCenter(new window.kakao.maps.LatLng(lat, lng));
  }, [options.userLocation, mapReady]);

  useEffect(() => {
    if (!mapRef.current) return;
    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];
    (options.markers ?? []).forEach((marker) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = marker.label;
      btn.style.cssText = [
        'border:none',
        'border-radius:999px',
        'padding:6px 10px',
        'font-size:12px',
        'font-weight:700',
        'cursor:pointer',
        marker.selected
          ? 'background:#1A1A2E;color:#fff'
          : 'background:#fff;color:#1A1A2E',
        'box-shadow:0 2px 8px rgba(0,0,0,0.18)',
      ].join(';');
      if (marker.onClick) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          marker.onClick!(marker.id);
        });
      }
      const overlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(marker.lat, marker.lng),
        content: btn,
        zIndex: marker.selected ? 10 : 5,
        clickable: true,
      });
      overlay.setMap(mapRef.current!);
      overlaysRef.current.push(overlay);
    });
  }, [options.markers, mapReady]);

  return mapRef;
}
