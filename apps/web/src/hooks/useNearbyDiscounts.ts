import { useQuery } from '@tanstack/react-query';
import { getDiscountsNearby } from '../services/discount.service';

export function useNearbyDiscounts(query: {
  lat?: number | undefined;
  lng?: number | undefined;
}) {
  return useQuery({
    queryKey: ['discounts', 'nearby', query],
    queryFn: () => getDiscountsNearby({ lat: query.lat!, lng: query.lng! }),
    enabled: Boolean(query.lat && query.lng),
    staleTime: 60 * 1000,
  });
}
