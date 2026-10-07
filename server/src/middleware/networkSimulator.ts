import { Request, Response, NextFunction } from 'express';

export interface SimulationOptions {
  minDelayMs?: number;
  maxDelayMs?: number;
  failureRate?: number; // 0 to 1
}

export function createNetworkSimulator(options: SimulationOptions = {}) {
  const minDelay = options.minDelayMs ?? 200;
  const maxDelay = options.maxDelayMs ?? 3000;
  const failureRate = options.failureRate ?? 0.10; // 10% failure

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Allow bypassing simulation for health checks or explicit test headers
    if (
      req.path === '/api/health' ||
      req.headers['x-disable-simulation'] === 'true' ||
      req.query.simulate === 'false'
    ) {
      next();
      return;
    }

    // Random latency between minDelay (200ms) and maxDelay (3000ms)
    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Handle client disconnect / aborted requests while sleeping
    if (req.destroyed || res.writableEnded) {
      return;
    }

    // Random 10% failure simulation
    const shouldFail = Math.random() < failureRate;
    if (shouldFail) {
      res.status(500).json({
        error: 'SimulatedInternalServerError',
        message: 'A simulated server network/database error occurred. Please retry.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
}
