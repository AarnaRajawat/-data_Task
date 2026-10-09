import { ApiHealthResponse, Ticket, TicketListResponse, TicketQueryParams } from '../types/ticket';

/**
 * Determine the API base URL with environment safety:
 * 1. Prioritize explicit `VITE_API_URL` environment variable (e.g. deployed Render backend URL).
 * 2. In Vite development mode (`import.meta.env.DEV`), fallback to 'http://localhost:5000'.
 * 3. In production with no VITE_API_URL set, default to '' (same-origin relative path / Netlify proxy).
 */
export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/$/, '');
  }
  if (import.meta.env.DEV) {
    return 'http://localhost:5000';
  }
  // Production fallback: relative URL to prevent mixed-content and localhost failures
  return '';
}

export const API_BASE_URL = getApiBaseUrl();

export class ApiError extends Error {
  public status: number;
  public data?: any;
  public isNetworkError: boolean;

  constructor(message: string, status: number, data?: any, isNetworkError: boolean = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.isNetworkError = isNetworkError;
  }
}

/**
 * Build a standard URL safely supporting both absolute backend URLs and relative origins.
 */
export function buildApiUrl(path: string): URL {
  const base =
    API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const fullPath = API_BASE_URL ? `${API_BASE_URL}${cleanPath}` : cleanPath;
  return new URL(fullPath, base);
}

/**
 * Safe fetch wrapper that translates low-level network failures into informative ApiError instances.
 */
async function safeFetch(url: string | URL, init?: RequestInit): Promise<Response> {
  try {
    const response = await fetch(url.toString(), init);
    return response;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw err; // Preserve AbortController cancellation for React Query
    }
    const rawMessage = err instanceof Error ? err.message : 'Network request failed';
    throw new ApiError(
      `Network connection failed (${rawMessage}). The API server may be offline, sleeping, or blocked by CORS. Please click Retry.`,
      0,
      null,
      true
    );
  }
}

/**
 * Fetch tickets with search, filtering, sorting, pagination, and AbortController signal support.
 */
export async function fetchTickets(
  params: TicketQueryParams,
  signal?: AbortSignal
): Promise<TicketListResponse> {
  const url = buildApiUrl('/api/tickets');

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

  const response = await safeFetch(url, {
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
  const url = buildApiUrl(`/api/tickets/${id}`);
  const response = await safeFetch(url, {
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
  const url = buildApiUrl('/api/health');
  const response = await safeFetch(url, {
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

