import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TicketExplorerPage } from '../src/pages/TicketExplorerPage';
import * as api from '../src/services/api';

describe('Race Condition & Stale Response Protection', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
    vi.restoreAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('prevents slow superseded Request A from overwriting faster newer Request B', async () => {
    vi.spyOn(api, 'fetchTickets').mockImplementation(async (params, signal) => {
      // Slow Request A for query 'slow'
      if (params.q === 'slow') {
        return new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            resolve({
              data: [
                {
                  id: 101,
                  ticketNumber: 'TIC-101',
                  customerName: 'Stale Customer A',
                  customerEmail: 'stale@a.com',
                  subject: 'Stale Subject A',
                  description: 'This is stale data from Request A',
                  status: 'open',
                  priority: 'high',
                  category: 'billing',
                  assignedTo: 'Agent A',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              ],
              pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
            });
          }, 350);

          if (signal) {
            signal.addEventListener('abort', () => {
              clearTimeout(timer);
              reject(new DOMException('Aborted', 'AbortError'));
            });
          }
        });
      }

      // Fast Request B for query 'fast'
      if (params.q === 'fast') {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: [
                {
                  id: 202,
                  ticketNumber: 'TIC-202',
                  customerName: 'Fresh Customer B',
                  customerEmail: 'fresh@b.com',
                  subject: 'Fresh Subject B',
                  description: 'This is the newest data from Request B',
                  status: 'resolved',
                  priority: 'low',
                  category: 'technical',
                  assignedTo: 'Agent B',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              ],
              pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
            });
          }, 50);
        });
      }

      return {
        data: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 1 },
      };
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

    const searchInput = screen.getByPlaceholderText(/Search tickets/i);

    // 1. Trigger slow query
    act(() => {
      fireEvent.change(searchInput, { target: { value: 'slow' } });
    });

    // Wait for search debounce (300ms) to trigger slow query
    await act(async () => {
      await new Promise((r) => setTimeout(r, 350));
    });

    // 2. While slow query is in flight, type 'fast' to supersede it with Request B
    act(() => {
      fireEvent.change(searchInput, { target: { value: 'fast' } });
    });

    // Wait for debounce and fast query execution
    await act(async () => {
      await new Promise((r) => setTimeout(r, 450));
    });

    // Verify Fresh Customer B is rendered
    await waitFor(() => {
      expect(screen.getByText('Fresh Customer B')).toBeInTheDocument();
    });

    // Wait past the slow query's potential completion time
    await act(async () => {
      await new Promise((r) => setTimeout(r, 500));
    });

    // Verify Stale Customer A was discarded and never overwrote Fresh Customer B
    expect(screen.queryByText('Stale Customer A')).not.toBeInTheDocument();
    expect(screen.getByText('Fresh Customer B')).toBeInTheDocument();
  });
});
