import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchTickets } from '../services/api';
import { TicketQueryParams } from '../types/ticket';

export function useTicketsQuery(params: TicketQueryParams) {
  const queryKey = [
    'tickets',
    {
      q: params.q || '',
      status: params.status || 'all',
      priority: params.priority || 'all',
      category: params.category || 'all',
      sort: params.sort || 'newest',
      page: params.page || 1,
      limit: params.limit || 50,
    },
  ] as const;

  return useQuery({
    queryKey,
    queryFn: ({ signal }) => fetchTickets(params, signal),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30, // 30 seconds fresh
    refetchOnWindowFocus: false,
  });
}
