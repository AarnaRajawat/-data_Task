import { ALL_TICKETS } from '../data/mockTickets.js';
import { Ticket, TicketListResponse, TicketQueryParams } from '../types/ticket.js';

const PRIORITY_WEIGHTS: Record<string, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export class TicketService {
  private tickets: Ticket[] = ALL_TICKETS;

  public queryTickets(params: TicketQueryParams): TicketListResponse {
    let results = this.tickets;

    // 1. Text Search across multiple fields
    const query = (params.q || '').trim().toLowerCase();
    if (query) {
      results = results.filter((ticket) => {
        return (
          ticket.ticketNumber.toLowerCase().includes(query) ||
          ticket.customerName.toLowerCase().includes(query) ||
          ticket.customerEmail.toLowerCase().includes(query) ||
          ticket.subject.toLowerCase().includes(query) ||
          ticket.description.toLowerCase().includes(query) ||
          ticket.assignedTo.toLowerCase().includes(query) ||
          ticket.category.toLowerCase().includes(query)
        );
      });
    }

    // 2. Status Filtering
    if (params.status && params.status !== 'all') {
      const statusLower = params.status.toLowerCase();
      results = results.filter((ticket) => ticket.status === statusLower);
    }

    // 3. Priority Filtering
    if (params.priority && params.priority !== 'all') {
      const priorityLower = params.priority.toLowerCase();
      results = results.filter((ticket) => ticket.priority === priorityLower);
    }

    // 4. Category Filtering
    if (params.category && params.category !== 'all') {
      const categoryLower = params.category.toLowerCase();
      results = results.filter((ticket) => ticket.category === categoryLower);
    }

    // 5. Sorting
    const sort = params.sort || 'newest';
    results = [...results].sort((a, b) => {
      switch (sort) {
        case 'oldest':
        case 'created-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

        case 'newest':
        case 'created-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

        case 'updated-asc':
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();

        case 'updated-desc':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();

        case 'priority-desc': {
          const diff = (PRIORITY_WEIGHTS[b.priority] || 0) - (PRIORITY_WEIGHTS[a.priority] || 0);
          if (diff !== 0) return diff;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        case 'priority-asc': {
          const diff = (PRIORITY_WEIGHTS[a.priority] || 0) - (PRIORITY_WEIGHTS[b.priority] || 0);
          if (diff !== 0) return diff;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    // 6. Pagination
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(200, Number(params.limit) || 50));
    const total = results.length;
    const totalPages = Math.ceil(total / limit) || 1;

    const startIndex = (page - 1) * limit;
    const paginatedData = results.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  public getTicketById(id: number): Ticket | undefined {
    return this.tickets.find((ticket) => ticket.id === id);
  }

  public getTotalCount(): number {
    return this.tickets.length;
  }
}

export const ticketService = new TicketService();
