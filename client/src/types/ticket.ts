export type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'billing' | 'technical' | 'account' | 'product' | 'shipping' | 'other';

export interface Ticket {
  id: number;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

export type TicketSortField =
  | 'newest'
  | 'oldest'
  | 'created-desc'
  | 'created-asc'
  | 'updated-desc'
  | 'updated-asc'
  | 'priority-desc'
  | 'priority-asc';

export interface TicketQueryParams {
  q?: string;
  status?: TicketStatus | 'all';
  priority?: TicketPriority | 'all';
  category?: TicketCategory | 'all';
  sort?: TicketSortField | string;
  page?: number;
  limit?: number;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TicketListResponse {
  data: Ticket[];
  pagination: PaginationMetadata;
}

export interface ApiHealthResponse {
  status: 'healthy' | 'degraded' | 'error';
  timestamp: string;
  uptimeSeconds: number;
  datasetRecords: number;
  environment: string;
}
