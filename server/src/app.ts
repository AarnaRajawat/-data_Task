import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ticketRoutes from './routes/ticketRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { createNetworkSimulator } from './middleware/networkSimulator.js';

dotenv.config();

export function createApp() {
  const app = express();

  // CORS Configuration - allow local Vite dev server and deployed frontend
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, health checks)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
          'https://taskda.netlify.app',
          'http://localhost:5173',
          'http://localhost:4173',
          'http://localhost:3000',
          'http://localhost:5000',
          'http://127.0.0.1:5173',
        ];

        if (
          allowedOrigins.includes(origin) ||
          origin.endsWith('.netlify.app') ||
          origin.includes('localhost') ||
          origin.includes('127.0.0.1') ||
          (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL)
        ) {
          return callback(null, true);
        }

        // Allow all other origins with origin reflection
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'x-disable-simulation',
        'x-simulate',
        'x-simulate-failure',
        'x-simulate-error',
        'x-simulate-latency',
        'x-force-failure',
        'x-failure-rate',
        'x-delay-ms',
        'x-min-delay-ms',
        'x-max-delay-ms',
        'Accept',
      ],
    })
  );

  app.options('*', cors()); // Handle preflight across all routes

  app.use(express.json());

  // Real-world simulated latency (200-3000ms) and 10% failure rate
  app.use(createNetworkSimulator());

  // Root welcome & API info endpoint
  app.get('/', (_req, res) => {
    res.json({
      name: 'DareAI Support Ticket Explorer API',
      status: 'online',
      version: '1.0.0',
      datasetSize: '25,000+ records',
      endpoints: {
        health: '/api/health',
        tickets: '/api/tickets',
        ticketById: '/api/tickets/:id',
      },
      documentation: 'Visit http://localhost:5173 to access the frontend explorer UI.',
    });
  });

  // Mount API routes
  app.use('/health', healthRoutes);
  app.use('/api/health', healthRoutes);
  app.use('/api/tickets', ticketRoutes);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      error: 'NotFound',
      message: 'The requested API endpoint was not found.',
    });
  });

  return app;
}
