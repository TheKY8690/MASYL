import { useQuery } from '@tanstack/react-query';
import { getCafesNearby, type NearbyQuery } from '../services/cafe.service';

export function useCafesNearby(query: NearbyQuery, token?: string) {
  return useQuery({
    queryKey: ['cafes', 'nearby', query],
    queryFn: () => getCafesNearby(query, token),
    enabled: Boolean(query.lat && query.lng),
  });
}
