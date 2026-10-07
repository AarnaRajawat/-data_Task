import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TicketExplorerPage } from '../src/pages/TicketExplorerPage';
import * as api from '../src/services/api';

describe('Error State and Retry Behavior', () => {
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

  it('renders honest error state on API 500 failure and refetches when Retry is clicked', async () => {
    let hasFailed = true;

    const fetchSpy = vi.spyOn(api, 'fetchTickets').mockImplementation(async () => {
      if (hasFailed) {
        throw new api.ApiError('A simulated server network error occurred. Please retry.', 500);
      }
      return {
        data: [
          {
            id: 1,
            ticketNumber: 'TIC-10001',
            customerName: 'Recovered Customer',
            customerEmail: 'recovered@example.com',
            subject: 'Recovered after retry',
            description: 'Success state rendered properly',
            status: 'open',
            priority: 'medium',
            category: 'billing',
            assignedTo: 'Sarah Jenkins',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
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

    // Wait for error state to appear
    await waitFor(() => {
      expect(screen.getByText(/Unable to load tickets/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retry Request/i })).toBeInTheDocument();
    });

    // Toggle failure flag and click Retry
    hasFailed = false;
    const retryBtn = screen.getByRole('button', { name: /Retry Request/i });
    fireEvent.click(retryBtn);

    // Verify recovery and data render
    await waitFor(() => {
      expect(screen.getByText('Recovered Customer')).toBeInTheDocument();
      expect(screen.queryByText(/Unable to load tickets/i)).not.toBeInTheDocument();
    });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
