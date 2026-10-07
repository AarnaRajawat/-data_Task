import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { ticketService } from '../services/ticketService.js';
import { TicketCategory, TicketPriority, TicketSortField, TicketStatus } from '../types/ticket.js';

const router = Router();

const TicketQuerySchema = z.object({
  q: z.string().optional(),
  status: z.enum(['all', 'open', 'pending', 'resolved', 'closed']).optional(),
  priority: z.enum(['all', 'low', 'medium', 'high', 'urgent']).optional(),
  category: z.enum(['all', 'billing', 'technical', 'account', 'product', 'shipping', 'other']).optional(),
  sort: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(200).optional().default(50),
});

// GET /api/tickets
router.get('/', (req: Request, res: Response) => {
  try {
    const parseResult = TicketQuerySchema.safeParse(req.query);

    if (!parseResult.success) {
      res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid query parameters',
        details: parseResult.error.flatten(),
      });
      return;
    }

    const { q, status, priority, category, sort, page, limit } = parseResult.data;

    const result = ticketService.queryTickets({
      q,
      status: status as TicketStatus | 'all',
      priority: priority as TicketPriority | 'all',
      category: category as TicketCategory | 'all',
      sort: sort as TicketSortField,
      page,
      limit,
    });

    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown internal server error';
    res.status(500).json({
      error: 'InternalServerError',
      message,
    });
  }
});

// GET /api/tickets/:id
router.get('/:id', (req: Request, res: Response) => {
  const ticketId = parseInt(req.params.id, 10);

  if (isNaN(ticketId) || ticketId <= 0) {
    res.status(400).json({
      error: 'InvalidTicketId',
      message: 'Ticket ID must be a valid positive integer',
    });
    return;
  }

  const ticket = ticketService.getTicketById(ticketId);

  if (!ticket) {
    res.status(404).json({
      error: 'TicketNotFound',
      message: `Support ticket #${ticketId} was not found.`,
    });
    return;
  }

  res.json(ticket);
});

export default router;
