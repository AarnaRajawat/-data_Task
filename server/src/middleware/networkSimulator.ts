import { Request, Response, NextFunction } from 'express';

export interface SimulationOptions {
  minDelayMs?: number;
  maxDelayMs?: number;
  failureRate?: number; // 0 to 1
  enabled?: boolean;
}

export function createNetworkSimulator(options: SimulationOptions = {}) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 1. Health check paths are always exempted
    if (req.path === '/api/health' || req.path === '/health') {
      next();
      return;
    }

    // 2. Check for explicit bypass via header or query parameter
    const disableHeader = req.headers['x-disable-simulation'];
    const simulateQuery = req.query.simulate;
    const simulationQuery = req.query.simulation;

    if (
      disableHeader === 'true' ||
      disableHeader === '1' ||
      simulateQuery === 'false' ||
      simulateQuery === '0' ||
      simulationQuery === 'false' ||
      simulationQuery === '0'
    ) {
      next();
      return;
    }

    // 3. Check for explicit deliberate failure request (100% failure simulation)
    const forceFailureHeader =
      req.headers['x-simulate-failure'] === 'true' ||
      req.headers['x-simulate-error'] === 'true' ||
      req.headers['x-force-failure'] === 'true';

    const forceFailureQuery =
      req.query.simulate_failure === 'true' ||
      req.query.simulate_error === 'true' ||
      req.query.force_failure === 'true';

    if (forceFailureHeader || forceFailureQuery) {
      res.status(500).json({
        error: 'SimulatedInternalServerError',
        message: 'A simulated server network/database error occurred. Please retry.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // 4. Determine if simulation is enabled
    const isExplicitlySimulated =
      req.headers['x-simulate'] === 'true' ||
      req.headers['x-enable-simulation'] === 'true' ||
      req.headers['x-simulate-latency'] === 'true' ||
      simulateQuery === 'true' ||
      simulateQuery === '1' ||
      simulationQuery === 'true' ||
      simulationQuery === '1' ||
      req.query.simulate_latency === 'true';

    const envSimulation = process.env.ENABLE_NETWORK_SIMULATION;
    const isEnvSimulationEnabled = envSimulation === 'true' || envSimulation === '1';

    // In production and normal operation, simulation is disabled by default for reliable browsing
    // unless explicitly enabled via environment variable, options, or per-request simulation controls.
    const defaultEnabled = false;

    const isSimulationActive =
      options.enabled ??
      (isExplicitlySimulated || isEnvSimulationEnabled || defaultEnabled);

    if (!isSimulationActive) {
      next();
      return;
    }

    // 5. Calculate delays and failure rates
    const parsedMinDelay =
      Number(req.headers['x-min-delay-ms']) ||
      Number(req.query.min_delay_ms) ||
      options.minDelayMs ||
      Number(process.env.SIMULATION_MIN_DELAY_MS || process.env.MIN_DELAY_MS) ||
      200;

    const parsedMaxDelay =
      Number(req.headers['x-max-delay-ms']) ||
      Number(req.query.max_delay_ms) ||
      options.maxDelayMs ||
      Number(process.env.SIMULATION_MAX_DELAY_MS || process.env.MAX_DELAY_MS) ||
      3000;

    const customExactDelay =
      Number(req.headers['x-delay-ms']) ||
      Number(req.query.delay_ms);

    const minDelay = Math.max(0, parsedMinDelay);
    const maxDelay = Math.max(minDelay, parsedMaxDelay);

    // Latency injection
    const delay = !isNaN(customExactDelay) && customExactDelay > 0
      ? customExactDelay
      : Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    // Handle client disconnect / aborted requests while sleeping
    if (req.destroyed || res.writableEnded) {
      return;
    }

    // 6. Calculate failure rate
    const parsedFailureRate =
      req.headers['x-failure-rate'] !== undefined
        ? Number(req.headers['x-failure-rate'])
        : req.query.failure_rate !== undefined
        ? Number(req.query.failure_rate)
        : options.failureRate !== undefined
        ? options.failureRate
        : process.env.SIMULATION_FAILURE_RATE !== undefined
        ? Number(process.env.SIMULATION_FAILURE_RATE)
        : process.env.FAILURE_RATE !== undefined
        ? Number(process.env.FAILURE_RATE)
        : 0.10; // Default 10% when simulation is active

    const failureRate = Math.max(0, Math.min(1, isNaN(parsedFailureRate) ? 0.10 : parsedFailureRate));

    if (failureRate > 0 && Math.random() < failureRate) {
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
