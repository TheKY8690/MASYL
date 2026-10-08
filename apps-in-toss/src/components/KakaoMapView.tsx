import { useRef } from 'react';
import { useKakaoMap, type MapMarkerData } from '../hooks/useKakaoMap';

export function KakaoMapView({
  center,
  markers,
}: {
  center: { lat: number; lng: number };
  markers: MapMarkerData[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  useKakaoMap(containerRef, {
    centerLat: center.lat,
    centerLng: center.lng,
    level: 4,
    markers,
    userLocation: center,
  });

  return <div ref={containerRef} className="map-canvas" />;
}
