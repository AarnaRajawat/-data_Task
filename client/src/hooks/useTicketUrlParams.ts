import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TicketCategory, TicketPriority, TicketSortField, TicketStatus } from '../types/ticket';

export interface TicketFilterState {
  q: string;
  status: TicketStatus | 'all';
  priority: TicketPriority | 'all';
  category: TicketCategory | 'all';
  sort: TicketSortField | string;
  page: number;
  ticketId: number | null;
}

const VALID_STATUSES: (TicketStatus | 'all')[] = ['all', 'open', 'pending', 'resolved', 'closed'];
const VALID_PRIORITIES: (TicketPriority | 'all')[] = ['all', 'low', 'medium', 'high', 'urgent'];
const VALID_CATEGORIES: (TicketCategory | 'all')[] = [
  'all',
  'billing',
  'technical',
  'account',
  'product',
  'shipping',
  'other',
];

export function useTicketUrlParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse state cleanly from URL Search Parameters
  const state: TicketFilterState = useMemo(() => {
    const rawQ = searchParams.get('q') || '';
    const rawStatus = searchParams.get('status') || 'all';
    const rawPriority = searchParams.get('priority') || 'all';
    const rawCategory = searchParams.get('category') || 'all';
    const rawSort = searchParams.get('sort') || 'newest';
    const rawPage = parseInt(searchParams.get('page') || '1', 10);
    const rawTicket = searchParams.get('ticket');

    const status = VALID_STATUSES.includes(rawStatus as any)
      ? (rawStatus as TicketStatus | 'all')
      : 'all';
    const priority = VALID_PRIORITIES.includes(rawPriority as any)
      ? (rawPriority as TicketPriority | 'all')
      : 'all';
    const category = VALID_CATEGORIES.includes(rawCategory as any)
      ? (rawCategory as TicketCategory | 'all')
      : 'all';
    const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
    const ticketId = rawTicket && !isNaN(parseInt(rawTicket, 10)) ? parseInt(rawTicket, 10) : null;

    return {
      q: rawQ,
      status,
      priority,
      category,
      sort: rawSort,
      page,
      ticketId,
    };
  }, [searchParams]);

  // Update query/filter/sort parameters with automatic page reset to 1
  const updateFilters = useCallback(
    (updates: Partial<Omit<TicketFilterState, 'ticketId'>>, resetPage: boolean = true) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);

          if (updates.q !== undefined) {
            if (updates.q.trim()) {
              next.set('q', updates.q.trim());
            } else {
              next.delete('q');
            }
          }

          if (updates.status !== undefined) {
            if (updates.status && updates.status !== 'all') {
              next.set('status', updates.status);
            } else {
              next.delete('status');
            }
          }

          if (updates.priority !== undefined) {
            if (updates.priority && updates.priority !== 'all') {
              next.set('priority', updates.priority);
            } else {
              next.delete('priority');
            }
          }

          if (updates.category !== undefined) {
            if (updates.category && updates.category !== 'all') {
              next.set('category', updates.category);
            } else {
              next.delete('category');
            }
          }

          if (updates.sort !== undefined) {
            if (updates.sort && updates.sort !== 'newest') {
              next.set('sort', updates.sort);
            } else {
              next.delete('sort');
            }
          }

          if (updates.page !== undefined) {
            if (updates.page > 1) {
              next.set('page', updates.page.toString());
            } else {
              next.delete('page');
            }
          } else if (resetPage) {
            // When filter changes, reset to page 1
            next.delete('page');
          }

          return next;
        },
        { replace: false }
      );
    },
    [setSearchParams]
  );

  // Set page specifically
  const setPage = useCallback(
    (newPage: number) => {
      updateFilters({ page: newPage }, false);
    },
    [updateFilters]
  );

  // Clear all filters, query, sort, and page
  const clearFilters = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams();
        // Keep selected ticket open if any
        const ticket = prev.get('ticket');
        if (ticket) {
          next.set('ticket', ticket);
        }
        return next;
      },
      { replace: false }
    );
  }, [setSearchParams]);

  // Open ticket in URL drawer
  const openTicket = useCallback(
    (id: number) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('ticket', id.toString());
          return next;
        },
        { replace: false }
      );
    },
    [setSearchParams]
  );

  // Close ticket drawer, preserving all search, filter, sort, and page state
  const closeTicket = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('ticket');
        return next;
      },
      { replace: false }
    );
  }, [setSearchParams]);

  return {
    state,
    updateFilters,
    setPage,
    clearFilters,
    openTicket,
    closeTicket,
  };
}
