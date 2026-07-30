/**
 * Integration tests — Vehicle Purchase Endpoint
 *
 * Endpoint: POST /api/v1/vehicles/:id/purchase
 *
 * Business Rules & Endpoint Contracts:
 *  - 401 Unauthorized when request lacks Bearer token.
 *  - 200 OK & Decrement quantity by 1 when caller is authenticated (ADMIN, STAFF, VIEWER).
 *  - 409 Conflict when vehicle quantity is 0 (out of stock).
 *  - 404 Not Found when vehicle ID does not exist or has been soft-deleted.
 *  - Sequential purchases reduce quantity step by step down to 0, then fail with 409.
 */

import request from 'supertest';
import { createApp } from '../../src/app';
import type { Application } from 'express';

let app: Application;

async function seedAdminToken(a: Application): Promise<string> {
  const res = await request(a)
    .post('/api/v1/test/seed-user')
    .send({
      name:     `Admin ${Date.now()}`,
      email:    `admin.${Date.now()}@purchase.test`,
      password: 'TestPass1!',
      role:     'ADMIN',
    });
  return (res.body.data as { accessToken: string }).accessToken;
}

async function seedViewerToken(a: Application): Promise<string> {
  const res = await request(a)
    .post('/api/v1/auth/register')
    .send({
      name:     `Viewer ${Date.now()}`,
      email:    `viewer.${Date.now()}@purchase.test`,
      password: 'TestPass1!',
    });
  return (res.body.data as { accessToken: string }).accessToken;
}

async function createVehicle(
  a: Application,
  token: string,
  quantity = 2,
): Promise<string> {
  const res = await request(a)
    .post('/api/v1/vehicles')
    .set('Authorization', `Bearer ${token}`)
    .send({
      make:       'Toyota',
      model:      'Camry',
      year:       2023,
      category:   'SEDAN',
      powertrain: 'PETROL',
      price:      '28500.00',
      quantity,
    });
  return (res.body.data as { vehicle: { id: string } }).vehicle.id;
}

describe('POST /api/v1/vehicles/:id/purchase', () => {
  let adminToken: string;
  let viewerToken: string;

  beforeEach(async () => {
    app         = createApp();
    adminToken  = await seedAdminToken(app);
    viewerToken = await seedViewerToken(app);
  });

  it('returns 401 Unauthorized when no authentication token is provided', async () => {
    const vehicleId = await createVehicle(app, adminToken, 5);

    const res = await request(app).post(`/api/v1/vehicles/${vehicleId}/purchase`);

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      status: 'fail',
      statusCode: 401,
    });
  });

  it('decreases vehicle quantity by 1 when purchased by authenticated viewer', async () => {
    const vehicleId = await createVehicle(app, adminToken, 3);

    const res = await request(app)
      .post(`/api/v1/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'success',
      data: {
        vehicle: {
          id: vehicleId,
          quantity: 2,
        },
      },
    });
  });

  it('allows sequential purchases until stock drops to zero, then returns 409 Conflict', async () => {
    const vehicleId = await createVehicle(app, adminToken, 2);

    // Purchase 1 -> quantity becomes 1
    const res1 = await request(app)
      .post(`/api/v1/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(res1.status).toBe(200);
    expect(res1.body.data.vehicle.quantity).toBe(1);

    // Purchase 2 -> quantity becomes 0
    const res2 = await request(app)
      .post(`/api/v1/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(res2.status).toBe(200);
    expect(res2.body.data.vehicle.quantity).toBe(0);

    // Purchase 3 -> out of stock, should return 409 Conflict
    const res3 = await request(app)
      .post(`/api/v1/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(res3.status).toBe(409);
    expect(res3.body).toMatchObject({
      status: 'fail',
      statusCode: 409,
      message: 'Vehicle is out of stock',
    });
  });

  it('returns 404 Not Found when attempting to purchase a non-existent vehicle', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles/non-existent-id/purchase')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      status: 'fail',
      statusCode: 404,
    });
  });

  it('returns 404 Not Found when vehicle has been soft-deleted', async () => {
    const vehicleId = await createVehicle(app, adminToken, 5);

    // Soft delete the vehicle
    await request(app)
      .delete(`/api/v1/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    // Attempt purchase
    const res = await request(app)
      .post(`/api/v1/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(404);
  });
});
