import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TicketExplorerPage } from '../src/pages/TicketExplorerPage';
import * as api from '../src/services/api';

describe('Keyboard Accessibility Flow', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    vi.restoreAllMocks();
  });

  it('allows opening ticket with Enter key and closing drawer with Escape key', async () => {
    vi.spyOn(api, 'fetchTickets').mockResolvedValue({
      data: [
        {
          id: 42,
          ticketNumber: 'TIC-10042',
          customerName: 'Accessible User',
          customerEmail: 'a11y@example.com',
          subject: 'Keyboard Navigation Test Ticket',
          description: 'Testing WCAG compliance with keyboard navigation',
          status: 'open',
          priority: 'urgent',
          category: 'technical',
          assignedTo: 'Marcus Chen',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
    });

    vi.spyOn(api, 'fetchTicketById').mockResolvedValue({
      id: 42,
      ticketNumber: 'TIC-10042',
      customerName: 'Accessible User',
      customerEmail: 'a11y@example.com',
      subject: 'Keyboard Navigation Test Ticket',
      description: 'Testing WCAG compliance with keyboard navigation',
      status: 'open',
      priority: 'urgent',
      category: 'technical',
      assignedTo: 'Marcus Chen',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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

    // Wait for row to appear
    await waitFor(() => {
      expect(screen.getByText('Accessible User')).toBeInTheDocument();
    });

    // Find row by accessible role button / tabIndex
    const ticketRow = screen.getByRole('button', {
      name: /Ticket TIC-10042/i,
    });

    expect(ticketRow).toHaveAttribute('tabIndex', '0');

    // Press Enter on the row to open drawer
    fireEvent.keyDown(ticketRow, { key: 'Enter', code: 'Enter' });

    // Verify drawer opened
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Customer Information')).toBeInTheDocument();
    });

    // Press Escape key on window to close drawer
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

    // Verify drawer is closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
