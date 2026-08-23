'use client';

import { useEffect, useState } from 'react';

export type KakaoPlace = kakao.maps.services.PlaceSearchResult;

interface UseKakaoPlacesOptions {
  lat?: number | undefined;
  lng?: number | undefined;
  radius?: number;
}

export function useKakaoPlaces({
  lat,
  lng,
  radius = 1000,
}: UseKakaoPlacesOptions) {
  const [places, setPlaces] = useState<KakaoPlace[]>([]);

  useEffect(() => {
    if (!lat || !lng) return;

    let cancelled = false;

    const search = () => {
      if (!window.kakao?.maps?.services) return false;

      const ps = new window.kakao.maps.services.Places();
      ps.keywordSearch(
        '카페',
        (result, status) => {
          if (cancelled) return;
          if (status === window.kakao.maps.services.Status.OK) {
            setPlaces(result);
          }
        },
        {
          location: new window.kakao.maps.LatLng(lat, lng),
          radius,
          sort: window.kakao.maps.services.SortBy.DISTANCE,
          size: 15,
        },
      );
      return true;
    };

    let retries = 0;
    const trySearch = () => {
      if (!search() && retries < 30) {
        retries++;
        setTimeout(trySearch, 100);
      }
    };
    trySearch();

    return () => {
      cancelled = true;
    };
  }, [lat, lng, radius]);

  return places;
}
