/**
 * Integration tests — Extended Vehicle endpoints
 *
 * Covers the additional endpoints specified in the project requirements:
 *
 *   PUT    /api/v1/vehicles/:id            — full replace update (ADMIN | STAFF)
 *   GET    /api/v1/vehicles/search         — search by make, model, category, price range
 *   POST   /api/v1/vehicles/:id/purchase   — purchase one unit (decreases quantity, authenticated)
 *   POST   /api/v1/vehicles/:id/restock    — restock units (ADMIN only)
 *
 * TDD: tests are written first; implementation must make them pass.
 */

import request from 'supertest';
import { createApp } from '../../src/app';

// ---------------------------------------------------------------------------
// One app instance per file — in-memory store accumulates across describe blocks
// which is intentional here since we build on created vehicles
// ---------------------------------------------------------------------------
const app = createApp();

// ---------------------------------------------------------------------------
// Fixture helpers (mirrored from vehicles.test.ts)
// ---------------------------------------------------------------------------

async function getTokenForRole(role: 'ADMIN' | 'STAFF'): Promise<string> {
  const res = await request(app)
    .post('/api/v1/test/seed-user')
    .send({
      name:     `${role} User ${Date.now()}`,
      email:    `${role.toLowerCase()}.${Date.now()}@ext.test`,
      password: 'TestPass1!',
      role,
    });
  return (res.body.data as { accessToken: string }).accessToken;
}

async function getViewerToken(): Promise<string> {
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name:     `Viewer ${Date.now()}`,
      email:    `viewer.${Date.now()}@ext.test`,
      password: 'TestPass1!',
    });
  return (res.body.data as { accessToken: string }).accessToken;
}

const validVehicleBody = () => ({
  make:       'Honda',
  model:      'Civic',
  year:       2023,
  category:   'SEDAN',
  powertrain: 'PETROL',
  price:      '22000.00',
  quantity:   5,
  color:      'Pearl White',
  mileage:    0,
});

async function createVehicle(token: string): Promise<{ id: string; quantity: number }> {
  const res = await request(app)
    .post('/api/v1/vehicles')
    .set('Authorization', `Bearer ${token}`)
    .send(validVehicleBody());
  return res.body.data.vehicle as { id: string; quantity: number };
}

// ===========================================================================
// PUT /api/v1/vehicles/:id — Full Replace Update
// ===========================================================================

describe('PUT /api/v1/vehicles/:id', () => {
  it('returns 401 without token', async () => {
    const res = await request(app)
      .put('/api/v1/vehicles/any-id')
      .send(validVehicleBody());
    expect(res.status).toBe(401);
  });

  it('returns 200 with fully updated vehicle when called by ADMIN', async () => {
    const adminToken = await getTokenForRole('ADMIN');
    const { id } = await createVehicle(adminToken);

    const updateBody = {
      make:       'Nissan',
      model:      'Altima',
      year:       2024,
      category:   'SEDAN',
      powertrain: 'HYBRID',
      price:      '35000.00',
      quantity:   8,
    };

    const res = await request(app)
      .put(`/api/v1/vehicles/${id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateBody);

    expect(res.status).toBe(200);
    expect(res.body.data.vehicle).toMatchObject({
      id,
      make:  'Nissan',
      model: 'Altima',
      year:  2024,
      price: '35000.00',
    });
  });

  it('returns 200 when called by STAFF', async () => {
    const adminToken = await getTokenForRole('ADMIN');
    const staffToken = await getTokenForRole('STAFF');
    const { id } = await createVehicle(adminToken);

    const res = await request(app)
      .put(`/api/v1/vehicles/${id}`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ ...validVehicleBody(), price: '26000.00' });

    expect(res.status).toBe(200);
    expect(res.body.data.vehicle.price).toBe('26000.00');
  });

  it('returns 403 when called by VIEWER', async () => {
    const adminToken  = await getTokenForRole('ADMIN');
    const viewerToken = await getViewerToken();
    const { id } = await createVehicle(adminToken);

    const res = await request(app)
      .put(`/api/v1/vehicles/${id}`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send(validVehicleBody());

    expect(res.status).toBe(403);
  });

  it('returns 422 when required fields are missing', async () => {
    const adminToken = await getTokenForRole('ADMIN');
    const { id } = await createVehicle(adminToken);

    // Omit required `make` field
    const { make: _m, ...bodyWithoutMake } = validVehicleBody();

    const res = await request(app)
      .put(`/api/v1/vehicles/${id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(bodyWithoutMake);

    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('make');
  });

  it('returns 404 when vehicle does not exist', async () => {
    const adminToken = await getTokenForRole('ADMIN');

    const res = await request(app)
      .put('/api/v1/vehicles/nonexistent-put-id')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validVehicleBody());

    expect(res.status).toBe(404);
  });
});

// ===========================================================================
// GET /api/v1/vehicles/search — Search Vehicles
// ===========================================================================

describe('GET /api/v1/vehicles/search', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/vehicles/search?make=Honda');
    expect(res.status).toBe(401);
  });

  it('returns 200 with matching results when searching by make', async () => {
    const adminToken  = await getTokenForRole('ADMIN');
    const viewerToken = await getViewerToken();

    await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validVehicleBody(), make: 'Ford', model: 'Mustang' });

    const res = await request(app)
      .get('/api/v1/vehicles/search?make=Ford')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('vehicles');
    const vehicles = res.body.data.vehicles as Array<{ make: string }>;
    expect(vehicles.some((v) => v.make === 'Ford')).toBe(true);
  });

  it('returns 200 with matching results when searching by model', async () => {
    const adminToken  = await getTokenForRole('ADMIN');
    const viewerToken = await getViewerToken();

    await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validVehicleBody(), make: 'Chevy', model: 'Silverado' });

    const res = await request(app)
      .get('/api/v1/vehicles/search?model=Silverado')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    const vehicles = res.body.data.vehicles as Array<{ model: string }>;
    expect(vehicles.some((v) => v.model === 'Silverado')).toBe(true);
  });

  it('returns 200 with matching results when searching by category', async () => {
    const adminToken  = await getTokenForRole('ADMIN');
    const viewerToken = await getViewerToken();

    await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validVehicleBody(), category: 'TRUCK', model: 'F-150' });

    const res = await request(app)
      .get('/api/v1/vehicles/search?category=TRUCK')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    const vehicles = res.body.data.vehicles as Array<{ category: string }>;
    expect(vehicles.every((v) => v.category === 'TRUCK')).toBe(true);
  });

  it('returns 200 filtered by price range', async () => {
    const adminToken  = await getTokenForRole('ADMIN');
    const viewerToken = await getViewerToken();

    await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validVehicleBody(), price: '12000.00', model: 'Budget' });

    await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validVehicleBody(), price: '90000.00', model: 'Luxury' });

    const res = await request(app)
      .get('/api/v1/vehicles/search?minPrice=10000&maxPrice=30000')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    const vehicles = res.body.data.vehicles as Array<{ price: string }>;
    vehicles.forEach((v) => {
      expect(parseFloat(v.price)).toBeGreaterThanOrEqual(10000);
      expect(parseFloat(v.price)).toBeLessThanOrEqual(30000);
    });
  });

  it('returns 200 with empty list when no vehicles match', async () => {
    const viewerToken = await getViewerToken();

    const res = await request(app)
      .get('/api/v1/vehicles/search?make=Lamborghini')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.vehicles).toBeDefined();
  });

  it('includes pagination metadata', async () => {
    const viewerToken = await getViewerToken();

    const res = await request(app)
      .get('/api/v1/vehicles/search?make=Honda')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('pagination');
    expect(res.body.data.pagination).toMatchObject({
      page:  expect.any(Number),
      limit: expect.any(Number),
      total: expect.any(Number),
    });
  });
});

// ===========================================================================
// POST /api/v1/vehicles/:id/purchase — Purchase a vehicle (decrease quantity)
// ===========================================================================

describe('POST /api/v1/vehicles/:id/purchase', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/v1/vehicles/any-id/purchase');
    expect(res.status).toBe(401);
  });

  it('returns 200 and decreases quantity by 1 when authenticated', async () => {
    const adminToken = await getTokenForRole('ADMIN');
    const vehicle    = await createVehicle(adminToken);

    const res = await request(app)
      .post(`/api/v1/vehicles/${vehicle.id}/purchase`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.vehicle.quantity).toBe(vehicle.quantity - 1);
  });

  it('allows VIEWER to purchase', async () => {
    const adminToken  = await getTokenForRole('ADMIN');
    const viewerToken = await getViewerToken();
    const vehicle     = await createVehicle(adminToken);

    const res = await request(app)
      .post(`/api/v1/vehicles/${vehicle.id}/purchase`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.vehicle.quantity).toBe(vehicle.quantity - 1);
  });

  it('returns 409 when vehicle is out of stock (quantity = 0)', async () => {
    const adminToken = await getTokenForRole('ADMIN');
    // Create a vehicle with quantity 0
    const res0 = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validVehicleBody(), quantity: 0 });
    const id = (res0.body.data as { vehicle: { id: string } }).vehicle.id;

    const res = await request(app)
      .post(`/api/v1/vehicles/${id}/purchase`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({ status: 'fail', statusCode: 409 });
  });

  it('returns 404 when vehicle does not exist', async () => {
    const viewerToken = await getViewerToken();

    const res = await request(app)
      .post('/api/v1/vehicles/nonexistent-purchase-id/purchase')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(404);
  });
});

// ===========================================================================
// POST /api/v1/vehicles/:id/restock — Restock vehicle (ADMIN only)
// ===========================================================================

describe('POST /api/v1/vehicles/:id/restock', () => {
  it('returns 401 without token', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles/any-id/restock')
      .send({ quantity: 5 });
    expect(res.status).toBe(401);
  });

  it('returns 200 and increases quantity when called by ADMIN', async () => {
    const adminToken = await getTokenForRole('ADMIN');
    const vehicle    = await createVehicle(adminToken);

    const res = await request(app)
      .post(`/api/v1/vehicles/${vehicle.id}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 10 });

    expect(res.status).toBe(200);
    expect(res.body.data.vehicle.quantity).toBe(vehicle.quantity + 10);
  });

  it('returns 403 when called by STAFF', async () => {
    const adminToken = await getTokenForRole('ADMIN');
    const staffToken = await getTokenForRole('STAFF');
    const vehicle    = await createVehicle(adminToken);

    const res = await request(app)
      .post(`/api/v1/vehicles/${vehicle.id}/restock`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ quantity: 5 });

    expect(res.status).toBe(403);
  });

  it('returns 403 when called by VIEWER', async () => {
    const adminToken  = await getTokenForRole('ADMIN');
    const viewerToken = await getViewerToken();
    const vehicle     = await createVehicle(adminToken);

    const res = await request(app)
      .post(`/api/v1/vehicles/${vehicle.id}/restock`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ quantity: 5 });

    expect(res.status).toBe(403);
  });

  it('returns 422 when quantity is missing or not a positive integer', async () => {
    const adminToken = await getTokenForRole('ADMIN');
    const vehicle    = await createVehicle(adminToken);

    const res = await request(app)
      .post(`/api/v1/vehicles/${vehicle.id}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: -5 });

    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('quantity');
  });

  it('returns 422 when quantity is zero', async () => {
    const adminToken = await getTokenForRole('ADMIN');
    const vehicle    = await createVehicle(adminToken);

    const res = await request(app)
      .post(`/api/v1/vehicles/${vehicle.id}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 0 });

    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('quantity');
  });

  it('returns 404 when vehicle does not exist', async () => {
    const adminToken = await getTokenForRole('ADMIN');

    const res = await request(app)
      .post('/api/v1/vehicles/nonexistent-restock-id/restock')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 5 });

    expect(res.status).toBe(404);
  });
});
