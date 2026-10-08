import { useEffect, useState } from 'react';
import {
  Accuracy,
  getCurrentLocation,
  GetCurrentLocationPermissionError,
} from '@apps-in-toss/web-framework';

export interface Coords {
  lat: number;
  lng: number;
}

function fromBrowser(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('geolocation unsupported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => reject(new Error('browser geolocation denied')),
    );
  });
}

export function useTossLocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const permission = await getCurrentLocation.getPermission();
        if (permission !== 'allowed') {
          await getCurrentLocation.openPermissionDialog();
        }
        const loc = await getCurrentLocation({ accuracy: Accuracy.Balanced });
        if (!cancelled) {
          setCoords({
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
          });
          setError(null);
        }
      } catch (err) {
        try {
          const browser = await fromBrowser();
          if (!cancelled) {
            setCoords(browser);
            setError(null);
          }
        } catch {
          if (!cancelled) {
            setError(
              err instanceof GetCurrentLocationPermissionError
                ? '위치 권한이 필요해요'
                : '위치를 가져오지 못했어요',
            );
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { coords, error, loading };
}
