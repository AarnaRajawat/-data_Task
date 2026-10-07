import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TicketExplorerPage } from '../src/pages/TicketExplorerPage';
import * as api from '../src/services/api';

describe('URL State Synchronization and Restoration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    vi.restoreAllMocks();
  });

  it('restores exact query, filters, sorting, and pagination from initial URL search params', async () => {
    const fetchSpy = vi.spyOn(api, 'fetchTickets').mockResolvedValue({
      data: [
        {
          id: 55,
          ticketNumber: 'TIC-10055',
          customerName: 'Alice Springs',
          customerEmail: 'alice@example.com',
          subject: 'Refund request on invoice',
          description: 'Detailed billing inquiry',
          status: 'open',
          priority: 'high',
          category: 'billing',
          assignedTo: 'Marcus Chen',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      pagination: { page: 3, limit: 50, total: 150, totalPages: 3 },
    });

    const targetUrl = '/tickets?q=refund&status=open&priority=high&category=billing&sort=updated-desc&page=3';

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[targetUrl]}>
          <Routes>
            <Route path="/tickets" element={<TicketExplorerPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          q: 'refund',
          status: 'open',
          priority: 'high',
          category: 'billing',
          sort: 'updated-desc',
          page: 3,
        }),
        expect.anything()
      );
    });

    // Check search input holds 'refund'
    const searchInput = screen.getByPlaceholderText(/Search tickets/i) as HTMLInputElement;
    expect(searchInput.value).toBe('refund');

    // Wait for data row to render
    await waitFor(() => {
      expect(screen.getByText('Alice Springs')).toBeInTheDocument();
    });
  });
});
