import { ApiHealthResponse, Ticket, TicketListResponse, TicketQueryParams } from '../types/ticket';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export class ApiError extends Error {
  public status: number;
  public data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Fetch tickets with search, filtering, sorting, pagination, and AbortController signal support.
 */
export async function fetchTickets(
  params: TicketQueryParams,
  signal?: AbortSignal
): Promise<TicketListResponse> {
  const url = new URL(`${API_BASE_URL}/api/tickets`);

  if (params.q?.trim()) {
    url.searchParams.set('q', params.q.trim());
  }
  if (params.status && params.status !== 'all') {
    url.searchParams.set('status', params.status);
  }
  if (params.priority && params.priority !== 'all') {
    url.searchParams.set('priority', params.priority);
  }
  if (params.category && params.category !== 'all') {
    url.searchParams.set('category', params.category);
  }
  if (params.sort) {
    url.searchParams.set('sort', params.sort);
  }
  if (params.page && params.page > 1) {
    url.searchParams.set('page', params.page.toString());
  }
  if (params.limit) {
    url.searchParams.set('limit', params.limit.toString());
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }
    throw new ApiError(
      errorData?.message || `Failed to fetch tickets (HTTP ${response.status})`,
      response.status,
      errorData
    );
  }

  return response.json();
}

/**
 * Fetch a single ticket by ID.
 */
export async function fetchTicketById(id: number, signal?: AbortSignal): Promise<Ticket> {
  const response = await fetch(`${API_BASE_URL}/api/tickets/${id}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }
    throw new ApiError(
      errorData?.message || `Failed to fetch ticket #${id} (HTTP ${response.status})`,
      response.status,
      errorData
    );
  }

  return response.json();
}

/**
 * Check API Health status.
 */
export async function fetchApiHealth(signal?: AbortSignal): Promise<ApiHealthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/health`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    throw new ApiError(`API Health check failed with status ${response.status}`, response.status);
  }

  return response.json();
}
