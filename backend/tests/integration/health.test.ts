/**
 * Integration test — Health endpoint
 *
 * This is the first test in the project. It verifies:
 * 1. The Express app factory creates a working app (no import errors).
 * 2. GET /api/v1/health returns 200 with the expected JSON shape.
 *
 * TDD cycle: this test was written BEFORE the route existed (Red),
 * then the route was added (Green), with no refactor needed at this stage.
 */

import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

describe('GET /api/v1/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'ok',
      environment: 'test',
    });
  });

  it('includes a timestamp and uptime in the response', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
    expect(typeof res.body.uptime).toBe('number');
  });

  it('returns 404 for an unknown route', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      status: 'fail',
      statusCode: 404,
    });
  });
});
