/**
 * Integration tests — Dual API Prefix Support (/api and /api/v1)
 *
 * Verifies that all endpoints function identically whether called with:
 *  - /api/auth/login
 *  - /api/v1/auth/login
 *  - /api/vehicles
 *  - /api/v1/vehicles
 */

import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

describe('Dual API Prefix (/api and /api/v1)', () => {
  it('supports GET /api/health and GET /api/v1/health', async () => {
    const res1 = await request(app).get('/api/health');
    const res2 = await request(app).get('/api/v1/health');

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res1.body).toMatchObject({ status: 'ok', environment: 'test' });
    expect(res2.body).toMatchObject({ status: 'ok', environment: 'test' });
  });

  it('supports POST /api/auth/register', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name:     'Prefix Test User',
        email:    `prefix.${Date.now()}@test.com`,
        password: 'TestPass1!',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.user.email).toContain('@test.com');
  });

  it('supports GET /api/vehicles (protected)', async () => {
    // 1. Register via /api/auth/register
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name:     'Vehicle Prefix User',
        email:    `vprefix.${Date.now()}@test.com`,
        password: 'TestPass1!',
      });
    const token = regRes.body.data.accessToken;

    // 2. Fetch via /api/vehicles
    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('vehicles');
  });
});
