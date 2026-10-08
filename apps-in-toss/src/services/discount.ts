import { apiFetch } from '../lib/api';

export interface NearbyDiscountItem {
  id: string;
  brandId: string | null;
  cafeId: string | null;
  title: string;
  discountType: string;
  discountValue: string;
  eventUrl: string | null;
  validFrom: string | null;
  validUntil: string | null;
  brandName: string | null;
  cafeName: string | null;
  cafeAddress: string | null;
  cafeLatitude: string | null;
  cafeLongitude: string | null;
}

export function getDiscountsNearby(query: {
  lat: number;
  lng: number;
  radius?: number;
  limit?: number;
}) {
  const params = new URLSearchParams({
    lat: String(query.lat),
    lng: String(query.lng),
    radius: String(query.radius ?? 0.5),
    limit: String(query.limit ?? 20),
  });
  return apiFetch<NearbyDiscountItem[]>(`/discounts/nearby?${params}`);
}
