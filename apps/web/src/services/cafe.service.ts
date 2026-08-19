import { apiFetch } from '../lib/api';

export interface NearbyQuery {
  lat: number;
  lng: number;
  radius?: number;
  limit?: number;
  offset?: number;
}

export async function getCafesNearby(query: NearbyQuery, token?: string) {
  const params = new URLSearchParams({
    lat: String(query.lat),
    lng: String(query.lng),
    ...(query.radius && { radius: String(query.radius) }),
    ...(query.limit && { limit: String(query.limit) }),
    ...(query.offset && { offset: String(query.offset) }),
  });
  return apiFetch<unknown[]>(`/cafes/nearby?${params}`, {
    ...(token !== undefined ? { token } : {}),
  });
}
