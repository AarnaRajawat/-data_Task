import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

const app = createApp();

describe('Ticket API Endpoints', () => {
  it('GET /api/health returns healthy status and 25000 records', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.datasetRecords).toBe(25000);
  });

  it('GET /api/tickets returns paginated records with default limit 50', async () => {
    const res = await request(app)
      .get('/api/tickets')
      .set('x-disable-simulation', 'true');

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBe(50);
    expect(res.body.pagination).toEqual({
      page: 1,
      limit: 50,
      total: 25000,
      totalPages: 500,
    });
  });

  it('GET /api/tickets filters by query search term', async () => {
    const res = await request(app)
      .get('/api/tickets?q=refund')
      .set('x-disable-simulation', 'true');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach((ticket: any) => {
      const match =
        ticket.subject.toLowerCase().includes('refund') ||
        ticket.description.toLowerCase().includes('refund') ||
        ticket.ticketNumber.toLowerCase().includes('refund') ||
        ticket.customerName.toLowerCase().includes('refund');
      expect(match).toBe(true);
    });
  });

  it('GET /api/tickets filters by status, priority, and category', async () => {
    const res = await request(app)
      .get('/api/tickets?status=open&priority=urgent&category=billing&limit=20')
      .set('x-disable-simulation', 'true');

    expect(res.status).toBe(200);
    res.body.data.forEach((ticket: any) => {
      expect(ticket.status).toBe('open');
      expect(ticket.priority).toBe('urgent');
      expect(ticket.category).toBe('billing');
    });
  });

  it('GET /api/tickets sorts correctly by updated-desc', async () => {
    const res = await request(app)
      .get('/api/tickets?sort=updated-desc&limit=10')
      .set('x-disable-simulation', 'true');

    expect(res.status).toBe(200);
    const tickets = res.body.data;
    for (let i = 0; i < tickets.length - 1; i++) {
      const current = new Date(tickets[i].updatedAt).getTime();
      const next = new Date(tickets[i + 1].updatedAt).getTime();
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });

  it('GET /api/tickets/:id returns single ticket detail', async () => {
    const res = await request(app)
      .get('/api/tickets/1')
      .set('x-disable-simulation', 'true');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.ticketNumber).toBe('TIC-10001');
    expect(res.body).toHaveProperty('customerName');
    expect(res.body).toHaveProperty('description');
  });

  it('GET /api/tickets/:id returns 404 for non-existent ticket', async () => {
    const res = await request(app)
      .get('/api/tickets/999999')
      .set('x-disable-simulation', 'true');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('TicketNotFound');
  });

  it('GET /api/tickets handles invalid query parameters with 400', async () => {
    const res = await request(app)
      .get('/api/tickets?status=invalid_status')
      .set('x-disable-simulation', 'true');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ValidationError');
  });

  describe('Network Simulation & Reliability Behavior', () => {
    it('GET /api/tickets returns 200 OK during normal browsing without simulation headers', async () => {
      const res = await request(app).get('/api/tickets?limit=10&page=1&sort=newest');
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBe(10);
    });

    it('GET /api/tickets returns 500 SimulatedInternalServerError when x-simulate-failure header is sent', async () => {
      const res = await request(app)
        .get('/api/tickets')
        .set('x-simulate-failure', 'true');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('SimulatedInternalServerError');
      expect(res.body.message).toContain('simulated server network/database error');
    });

    it('GET /api/tickets returns 500 SimulatedInternalServerError when simulate_error=true query param is passed', async () => {
      const res = await request(app).get('/api/tickets?simulate_error=true');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('SimulatedInternalServerError');
      expect(res.body.message).toContain('simulated server network/database error');
    });

    it('GET /api/tickets triggers simulation with failure rate when x-simulate is enabled', async () => {
      const resFail = await request(app)
        .get('/api/tickets')
        .set('x-simulate', 'true')
        .set('x-failure-rate', '1')
        .set('x-delay-ms', '1');

      expect(resFail.status).toBe(500);
      expect(resFail.body.error).toBe('SimulatedInternalServerError');

      const resSuccess = await request(app)
        .get('/api/tickets')
        .set('x-simulate', 'true')
        .set('x-failure-rate', '0')
        .set('x-delay-ms', '1');

      expect(resSuccess.status).toBe(200);
      expect(resSuccess.body.data).toBeInstanceOf(Array);
    });
  });
});

