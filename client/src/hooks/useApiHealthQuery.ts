import { useQuery } from '@tanstack/react-query';
import { fetchApiHealth } from '../services/api';

export function useApiHealthQuery() {
  return useQuery({
    queryKey: ['apiHealth'],
    queryFn: ({ signal }) => fetchApiHealth(signal),
    refetchInterval: 30000, // check health every 30 seconds
    staleTime: 10000,
    retry: 2,
  });
}
