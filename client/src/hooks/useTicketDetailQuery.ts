import { useQuery } from '@tanstack/react-query';
import { fetchTicketById } from '../services/api';

export function useTicketDetailQuery(ticketId: number | null) {
  return useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: ({ signal }) => {
      if (!ticketId) throw new Error('Ticket ID is required');
      return fetchTicketById(ticketId, signal);
    },
    enabled: ticketId !== null && ticketId > 0,
    staleTime: 1000 * 60, // 1 minute fresh
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
