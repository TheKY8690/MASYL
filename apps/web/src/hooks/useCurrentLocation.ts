'use client';

import { useEffect, useState } from 'react';

export function useCurrentLocation() {
  const [locationName, setLocationName] = useState<string>(() => {
    if (typeof navigator !== 'undefined' && !navigator.geolocation) {
      return '위치 정보 없음';
    }
    return '위치 확인 중...';
  });

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;

        const tryGeocode = (retries = 0) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const services = (window.kakao?.maps as any)?.services;
          if (!services) {
            if (retries < 30) setTimeout(() => tryGeocode(retries + 1), 100);
            return;
          }
          const geocoder = new services.Geocoder();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          geocoder.coord2RegionCode(
            lng,
            lat,
            (result: any[], status: string) => {
              if (status === services.Status.OK && result.length > 0) {
                const region = result[0];
                const name = [
                  region.region_1depth_name,
                  region.region_2depth_name,
                ]
                  .filter(Boolean)
                  .join(' ');
                setLocationName(name);
              } else {
                setLocationName('위치 정보 없음');
              }
            },
          );
        };

        tryGeocode();
      },
      () => setLocationName('위치 정보 없음'),
    );
  }, []);

  return locationName;
}
