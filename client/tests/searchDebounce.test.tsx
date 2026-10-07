import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TicketExplorerPage } from '../src/pages/TicketExplorerPage';
import * as api from '../src/services/api';

describe('Debounced Search Behavior', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    vi.restoreAllMocks();
  });

  it('does not fire API calls on every individual keystroke, waiting for debounce interval', async () => {
    const fetchSpy = vi.spyOn(api, 'fetchTickets').mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 50, total: 0, totalPages: 1 },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/tickets']}>
          <Routes>
            <Route path="/tickets" element={<TicketExplorerPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    const searchInput = screen.getByPlaceholderText(/Search tickets, customers or subjects/i);
    expect(searchInput).toBeInTheDocument();

    const initialCallCount = fetchSpy.mock.calls.length;

    // Simulate typing 'r', 'e', 'f', 'u', 'n', 'd' rapidly
    act(() => {
      fireEvent.change(searchInput, { target: { value: 'r' } });
      fireEvent.change(searchInput, { target: { value: 're' } });
      fireEvent.change(searchInput, { target: { value: 'ref' } });
      fireEvent.change(searchInput, { target: { value: 'refu' } });
      fireEvent.change(searchInput, { target: { value: 'refun' } });
      fireEvent.change(searchInput, { target: { value: 'refund' } });
    });

    // Immediately after typing, before debounce period, no new API calls should have fired
    expect(fetchSpy.mock.calls.length).toBe(initialCallCount);

    // Wait for 350ms (debounce is ~300ms)
    await act(async () => {
      await new Promise((r) => setTimeout(r, 400));
    });

    // Verify search triggered with 'refund'
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ q: 'refund' }),
      expect.anything()
    );
  });
});
