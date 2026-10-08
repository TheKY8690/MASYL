import { apiFetch } from '../lib/api';

export interface NearbyQuery {
  lat: number;
  lng: number;
  radius?: number;
  limit?: number;
  offset?: number;
}

export interface CafeRow {
  id: string;
  ownerId: string | null;
  name: string;
  address: string;
  latitude: string | number;
  longitude: string | number;
  phone: string | null;
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

export function getMyCafes(token: string) {
  return apiFetch<CafeRow[]>('/cafes/mine', { token });
}

export function createCafe(
  token: string,
  body: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    phone?: string;
  },
) {
  return apiFetch<CafeRow>('/cafes', {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
}
