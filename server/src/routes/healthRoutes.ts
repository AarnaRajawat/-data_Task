import { Router, Request, Response } from 'express';
import { ticketService } from '../services/ticketService.js';

const router = Router();

// GET /api/health
router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    datasetRecords: ticketService.getTotalCount(),
    environment: process.env.NODE_ENV || 'development',
  });
});

export default router;
