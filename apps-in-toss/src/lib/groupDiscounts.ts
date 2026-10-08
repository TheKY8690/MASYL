import type { NearbyDiscountItem } from '../services/discount';
import { calcDistanceM } from './distance';

export interface PlaceLike {
  place_name: string;
  distance?: string;
  x: string;
  y: string;
}

export interface DiscountGroup {
  key: string;
  displayName: string;
  distance?: number;
  cafeLatitude?: string | null;
  cafeLongitude?: string | null;
  discounts: NearbyDiscountItem[];
}

export function groupNearbyDiscounts(
  discounts: NearbyDiscountItem[],
  userLocation: { lat: number; lng: number } | null,
  nearbyPlaces: PlaceLike[],
): DiscountGroup[] {
  const filtered = !userLocation
    ? discounts
    : discounts.filter((d) => {
        if (d.cafeLatitude && d.cafeLongitude) {
          return (
            calcDistanceM(
              userLocation.lat,
              userLocation.lng,
              parseFloat(d.cafeLatitude),
              parseFloat(d.cafeLongitude),
            ) <= 500
          );
        }
        if (d.brandName) {
          return nearbyPlaces.some((p) => p.place_name.includes(d.brandName!));
        }
        return false;
      });

  const map = new Map<string, DiscountGroup>();
  for (const d of filtered) {
    const key = d.cafeId ?? d.brandId ?? d.id;
    if (!map.has(key)) {
      let distance: number | undefined;
      if (userLocation && d.cafeLatitude && d.cafeLongitude) {
        distance = Math.round(
          calcDistanceM(
            userLocation.lat,
            userLocation.lng,
            parseFloat(d.cafeLatitude),
            parseFloat(d.cafeLongitude),
          ),
        );
      } else if (d.brandName) {
        const matched = nearbyPlaces.find((p) =>
          p.place_name.includes(d.brandName!),
        );
        distance = matched?.distance
          ? parseInt(matched.distance, 10)
          : undefined;
      }
      map.set(key, {
        key,
        displayName: d.cafeName ?? d.brandName ?? '카페',
        distance,
        cafeLatitude: d.cafeLatitude,
        cafeLongitude: d.cafeLongitude,
        discounts: [],
      });
    }
    map.get(key)!.discounts.push(d);
  }

  return [...map.values()]
    .map((g) => ({
      ...g,
      discounts: [...g.discounts].sort((a, b) => {
        if (!a.validUntil && !b.validUntil) return 0;
        if (!a.validUntil) return 1;
        if (!b.validUntil) return -1;
        return (
          new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime()
        );
      }),
    }))
    .sort((a, b) => {
      if (a.distance == null && b.distance == null) return 0;
      if (a.distance == null) return 1;
      if (b.distance == null) return -1;
      return a.distance - b.distance;
    });
}
