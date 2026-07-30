/**
 * Integration tests — Vehicle Restock Endpoint
 *
 * Endpoint: POST /api/v1/vehicles/:id/restock
 *
 * Requirements & Rules:
 *  - ADMIN only: returns 403 Forbidden when called by STAFF or VIEWER.
 *  - 401 Unauthorized when no token is provided.
 *  - Validates input body:
 *      - quantity is required
 *      - quantity must be an integer >= 1
 *      - returns 422 Unprocessable Entity on validation failure
 *  - 200 OK: increases vehicle quantity by the specified restock amount.
 *  - 404 Not Found when vehicle ID does not exist or has been soft-deleted.
 */

import request from 'supertest';
import { createApp } from '../../src/app';
import type { Application } from 'express';

let app: Application;

async function seedUserToken(
  a: Application,
  role: 'ADMIN' | 'STAFF' | 'VIEWER',
): Promise<string> {
  if (role === 'VIEWER') {
    const res = await request(a)
      .post('/api/v1/auth/register')
      .send({
        name:     `Viewer ${Date.now()}`,
        email:    `viewer.${Date.now()}@restock.test`,
        password: 'TestPass1!',
      });
    return (res.body.data as { accessToken: string }).accessToken;
  }

  const res = await request(a)
    .post('/api/v1/test/seed-user')
    .send({
      name:     `${role} User ${Date.now()}`,
      email:    `${role.toLowerCase()}.${Date.now()}@restock.test`,
      password: 'TestPass1!',
      role,
    });
  return (res.body.data as { accessToken: string }).accessToken;
}

async function createVehicle(
  a: Application,
  token: string,
  quantity = 5,
): Promise<string> {
  const res = await request(a)
    .post('/api/v1/vehicles')
    .set('Authorization', `Bearer ${token}`)
    .send({
      make:       'Ford',
      model:      'Explorer',
      year:       2023,
      category:   'SUV',
      powertrain: 'PETROL',
      price:      '45000.00',
      quantity,
    });
  return (res.body.data as { vehicle: { id: string } }).vehicle.id;
}

describe('POST /api/v1/vehicles/:id/restock', () => {
  let adminToken: string;
  let staffToken: string;
  let viewerToken: string;

  beforeEach(async () => {
    app         = createApp();
    adminToken  = await seedUserToken(app, 'ADMIN');
    staffToken  = await seedUserToken(app, 'STAFF');
    viewerToken = await seedUserToken(app, 'VIEWER');
  });

  // ── Authentication & RBAC ──────────────────────────────────────────────────

  it('returns 401 Unauthorized when no authentication token is provided', async () => {
    const vehicleId = await createVehicle(app, adminToken, 5);

    const res = await request(app)
      .post(`/api/v1/vehicles/${vehicleId}/restock`)
      .send({ quantity: 10 });

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      status: 'fail',
      statusCode: 401,
    });
  });

  it('returns 403 Forbidden when called by a STAFF user', async () => {
    const vehicleId = await createVehicle(app, adminToken, 5);

    const res = await request(app)
      .post(`/api/v1/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ quantity: 10 });

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({
      status: 'fail',
      statusCode: 403,
    });
  });

  it('returns 403 Forbidden when called by a VIEWER user', async () => {
    const vehicleId = await createVehicle(app, adminToken, 5);

    const res = await request(app)
      .post(`/api/v1/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ quantity: 10 });

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({
      status: 'fail',
      statusCode: 403,
    });
  });

  // ── Input Validation ────────────────────────────────────────────────────────

  it('returns 422 Unprocessable Entity when request body is missing quantity', async () => {
    const vehicleId = await createVehicle(app, adminToken, 5);

    const res = await request(app)
      .post(`/api/v1/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('quantity');
  });

  it('returns 422 Unprocessable Entity when quantity is zero', async () => {
    const vehicleId = await createVehicle(app, adminToken, 5);

    const res = await request(app)
      .post(`/api/v1/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 0 });

    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('quantity');
  });

  it('returns 422 Unprocessable Entity when quantity is negative', async () => {
    const vehicleId = await createVehicle(app, adminToken, 5);

    const res = await request(app)
      .post(`/api/v1/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: -5 });

    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('quantity');
  });

  it('returns 422 Unprocessable Entity when quantity is not a number', async () => {
    const vehicleId = await createVehicle(app, adminToken, 5);

    const res = await request(app)
      .post(`/api/v1/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 'ten' });

    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('quantity');
  });

  // ── Successful Restock ──────────────────────────────────────────────────────

  it('returns 200 OK and increases vehicle quantity when called by ADMIN', async () => {
    const vehicleId = await createVehicle(app, adminToken, 5);

    const res = await request(app)
      .post(`/api/v1/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 15 });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'success',
      data: {
        vehicle: {
          id: vehicleId,
          quantity: 20,
        },
      },
    });
  });

  it('restocks an out-of-stock vehicle (quantity 0 -> 10)', async () => {
    // Create vehicle with 0 stock
    const createRes = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        make:       'Ford',
        model:      'Explorer',
        year:       2023,
        category:   'SUV',
        powertrain: 'PETROL',
        price:      '45000.00',
        quantity:   0,
      });
    const vehicleId = createRes.body.data.vehicle.id;

    const res = await request(app)
      .post(`/api/v1/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 10 });

    expect(res.status).toBe(200);
    expect(res.body.data.vehicle.quantity).toBe(10);
  });

  // ── Not Found ──────────────────────────────────────────────────────────────

  it('returns 404 Not Found when vehicle ID does not exist', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles/non-existent-id/restock')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 5 });

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      status: 'fail',
      statusCode: 404,
    });
  });

  it('returns 404 Not Found when attempting to restock a soft-deleted vehicle', async () => {
    const vehicleId = await createVehicle(app, adminToken, 5);

    // Soft delete vehicle
    await request(app)
      .delete(`/api/v1/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    // Attempt restock
    const res = await request(app)
      .post(`/api/v1/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 5 });

    expect(res.status).toBe(404);
  });
});
