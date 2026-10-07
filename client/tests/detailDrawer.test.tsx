import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TicketExplorerPage } from '../src/pages/TicketExplorerPage';
import * as api from '../src/services/api';

describe('Detail Drawer Deep-Linking and Focus Flow', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    vi.restoreAllMocks();
  });

  it('opens detail drawer from URL parameter, fetches detail, and closes cleanly', async () => {
    vi.spyOn(api, 'fetchTickets').mockResolvedValue({
      data: [
        {
          id: 1024,
          ticketNumber: 'TIC-11024',
          customerName: 'David Miller',
          customerEmail: 'david.miller@example.com',
          subject: 'Hardware security key delivery delayed',
          description: 'Package marked delivered but not received at reception desk',
          status: 'pending',
          priority: 'urgent',
          category: 'shipping',
          assignedTo: 'Carlos Mendez',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
    });

    const detailSpy = vi.spyOn(api, 'fetchTicketById').mockResolvedValue({
      id: 1024,
      ticketNumber: 'TIC-11024',
      customerName: 'David Miller',
      customerEmail: 'david.miller@example.com',
      subject: 'Hardware security key delivery delayed',
      description: 'Package marked delivered but not received at reception desk',
      status: 'pending',
      priority: 'urgent',
      category: 'shipping',
      assignedTo: 'Carlos Mendez',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/tickets?q=security&page=2&ticket=1024']}>
          <Routes>
            <Route path="/tickets" element={<TicketExplorerPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Detail drawer should be visible with role="dialog"
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Customer Information')).toBeInTheDocument();
      expect(screen.getByText('Carlos Mendez')).toBeInTheDocument();
    });

    expect(detailSpy).toHaveBeenCalledWith(1024, expect.anything());

    // Close the drawer using the close button
    const closeBtn = screen.getByLabelText('Close ticket details');
    fireEvent.click(closeBtn);

    // Verify dialog is closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
