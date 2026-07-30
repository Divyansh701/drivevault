/**
 * Integration tests — Vehicle CRUD endpoints
 *
 * TDD phase: RED — all tests will FAIL until the vehicle routes, controller,
 * use cases, and repository are implemented.
 *
 * Endpoints under test:
 *   POST   /api/v1/vehicles          — create vehicle  (ADMIN | STAFF)
 *   GET    /api/v1/vehicles          — list vehicles   (authenticated)
 *   GET    /api/v1/vehicles/:id      — get one vehicle (authenticated)
 *   PATCH  /api/v1/vehicles/:id      — update vehicle  (ADMIN | STAFF)
 *   DELETE /api/v1/vehicles/:id      — soft-delete     (ADMIN only)
 *
 * Search / filter:
 *   GET /api/v1/vehicles?make=Toyota
 *   GET /api/v1/vehicles?category=SUV
 *   GET /api/v1/vehicles?minPrice=20000&maxPrice=50000
 *
 * Coverage:
 *   Add Vehicle
 *     ✓ 201 with full vehicle payload (ADMIN)
 *     ✓ 201 with full vehicle payload (STAFF)
 *     ✓ 422 when required fields missing
 *     ✓ 422 when price is not a number
 *     ✓ 422 when year is out of range
 *     ✓ 403 when caller is VIEWER
 *     ✓ 401 when no token provided
 *
 *   Get Vehicles
 *     ✓ 200 with vehicle list (authenticated)
 *     ✓ 200 with empty list when no vehicles exist
 *     ✓ 401 without token
 *     ✓ Pagination metadata included
 *
 *   Get One Vehicle
 *     ✓ 200 with vehicle data (authenticated)
 *     ✓ 404 when vehicle does not exist
 *     ✓ 401 without token
 *
 *   Update Vehicle
 *     ✓ 200 with updated vehicle (ADMIN)
 *     ✓ 200 with partial update (STAFF)
 *     ✓ 404 when vehicle does not exist
 *     ✓ 403 when caller is VIEWER
 *     ✓ 401 without token
 *
 *   Delete Vehicle
 *     ✓ 204 on soft-delete (ADMIN)
 *     ✓ 403 when caller is STAFF
 *     ✓ 403 when caller is VIEWER
 *     ✓ 404 when vehicle does not exist
 *     ✓ 401 without token
 *
 *   Search
 *     ✓ filters by make
 *     ✓ filters by category
 *     ✓ filters by price range
 *     ✓ filters by year
 */

import request from 'supertest';
import { createApp } from '../../src/app';

// ---------------------------------------------------------------------------
// App instance — one per file to avoid shared state
// ---------------------------------------------------------------------------
const app = createApp();

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

/** Register a user and return their access token. */
async function getToken(
  role: 'ADMIN' | 'STAFF' | 'VIEWER' = 'VIEWER',
): Promise<string> {
  // Use unique emails so tests do not conflict in the shared in-memory store
  const email = `${role.toLowerCase()}.${Date.now()}@test.com`;

  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: `Test ${role}`, email, password: 'TestPass1!' });

  // In tests the default role is VIEWER; for ADMIN/STAFF we must use a
  // pre-seeded account or a test backdoor.  The test helpers expose a way to
  // register with an explicit role — the app must support this for test seeds.
  // If the register endpoint does not accept a role, tokens are obtained by
  // registering the account and then having the test infrastructure set the
  // role via the in-memory repository directly.
  //
  // We assume the app exposes `getTestApp()` or similar that provides a handle
  // to the in-memory store, OR the register endpoint accepts a `role` field
  // that is only honoured in test mode.
  //
  // For now the token from register will have VIEWER role and the tests that
  // need ADMIN/STAFF will use `getAdminToken()` / `getStaffToken()` below,
  // which register via a dedicated test seed route /api/v1/test/seed-user.
  return (res.body.data as { accessToken: string }).accessToken;
}

/**
 * Registers a VIEWER and returns the access token.
 * The in-memory store defaults new registrations to VIEWER.
 */
async function getViewerToken(): Promise<string> {
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name:     `Viewer ${Date.now()}`,
      email:    `viewer.${Date.now()}@test.com`,
      password: 'TestPass1!',
    });
  return (res.body.data as { accessToken: string }).accessToken;
}

/**
 * Registers via the test-only seed endpoint that accepts an explicit role.
 * Endpoint: POST /api/v1/test/seed-user
 * This route only exists when NODE_ENV=test and must be added to the router.
 */
async function getTokenForRole(role: 'ADMIN' | 'STAFF'): Promise<string> {
  const res = await request(app)
    .post('/api/v1/test/seed-user')
    .send({
      name:     `${role} User ${Date.now()}`,
      email:    `${role.toLowerCase()}.${Date.now()}@test.com`,
      password: 'TestPass1!',
      role,
    });
  return (res.body.data as { accessToken: string }).accessToken;
}

/** Minimal valid vehicle body — all required fields present. */
const validVehicleBody = () => ({
  make:       'Toyota',
  model:      'Camry',
  year:       2023,
  category:   'SEDAN',
  powertrain: 'PETROL',
  price:      '28500.00',
  quantity:   3,
  color:      'Midnight Black',
  mileage:    0,
});

// ===========================================================================
// POST /api/v1/vehicles — Add Vehicle
// ===========================================================================

describe('POST /api/v1/vehicles', () => {
  // ── Happy path ─────────────────────────────────────────────────────────────

  it('returns 201 with the created vehicle when called by ADMIN', async () => {
    const token = await getTokenForRole('ADMIN');

    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(validVehicleBody());

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      status: 'success',
      data: {
        vehicle: {
          make:     'Toyota',
          model:    'Camry',
          year:     2023,
          category: 'SEDAN',
          price:    '28500.00',
          quantity: 3,
        },
      },
    });
    expect(res.body.data.vehicle).toHaveProperty('id');
    expect(res.body.data.vehicle).toHaveProperty('createdAt');
  });

  it('returns 201 when called by STAFF', async () => {
    const token = await getTokenForRole('STAFF');

    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(validVehicleBody());

    expect(res.status).toBe(201);
  });

  // ── Authorization failures ─────────────────────────────────────────────────

  it('returns 403 when called by VIEWER', async () => {
    const token = await getViewerToken();

    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(validVehicleBody());

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ status: 'fail', statusCode: 403 });
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles')
      .send(validVehicleBody());

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ status: 'fail', statusCode: 401 });
  });

  // ── Validation ────────────────────────────────────────────────────────────

  it('returns 422 when make is missing', async () => {
    const token = await getTokenForRole('ADMIN');
    const { make: _m, ...body } = validVehicleBody();

    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(body);

    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('make');
  });

  it('returns 422 when model is missing', async () => {
    const token = await getTokenForRole('ADMIN');
    const { model: _m, ...body } = validVehicleBody();

    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(body);

    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('model');
  });

  it('returns 422 when price is not a valid decimal string', async () => {
    const token = await getTokenForRole('ADMIN');

    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validVehicleBody(), price: 'not-a-number' });

    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('price');
  });

  it('returns 422 when year is below 1886 (first automobile)', async () => {
    const token = await getTokenForRole('ADMIN');

    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validVehicleBody(), year: 1800 });

    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('year');
  });

  it('returns 422 when category is not a valid enum value', async () => {
    const token = await getTokenForRole('ADMIN');

    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validVehicleBody(), category: 'SPACESHIP' });

    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('category');
  });

  it('returns 422 when quantity is negative', async () => {
    const token = await getTokenForRole('ADMIN');

    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validVehicleBody(), quantity: -1 });

    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('quantity');
  });
});

// ===========================================================================
// GET /api/v1/vehicles — List Vehicles
// ===========================================================================

describe('GET /api/v1/vehicles', () => {
  // ── Authentication ──────────────────────────────────────────────────────

  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/v1/vehicles');

    expect(res.status).toBe(401);
  });

  // ── Happy path ─────────────────────────────────────────────────────────────

  it('returns 200 with a vehicle list when authenticated', async () => {
    const token = await getViewerToken();

    const res = await request(app)
      .get('/api/v1/vehicles')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'success' });
    expect(res.body.data).toHaveProperty('vehicles');
    expect(Array.isArray(res.body.data.vehicles)).toBe(true);
  });

  it('includes pagination metadata in the response', async () => {
    const token = await getViewerToken();

    const res = await request(app)
      .get('/api/v1/vehicles')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('pagination');
    expect(res.body.data.pagination).toMatchObject({
      page:  expect.any(Number),
      limit: expect.any(Number),
      total: expect.any(Number),
    });
  });

  it('returns 200 with empty list when no vehicles exist', async () => {
    // Fresh app instance for isolation (empty in-memory store)
    const freshApp = createApp();
    const regRes = await request(freshApp)
      .post('/api/v1/auth/register')
      .send({ name: 'Tmp', email: `tmp.${Date.now()}@test.com`, password: 'TmpPass1!' });
    const freshToken = (regRes.body.data as { accessToken: string }).accessToken;

    const res = await request(freshApp)
      .get('/api/v1/vehicles')
      .set('Authorization', `Bearer ${freshToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.vehicles).toHaveLength(0);
    expect(res.body.data.pagination.total).toBe(0);
  });

  // ── Search / filters ─────────────────────────────────────────────────────

  it('filters by make', async () => {
    const adminToken = await getTokenForRole('ADMIN');

    // Seed two vehicles
    await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validVehicleBody(), make: 'Toyota', model: 'Camry' });

    await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validVehicleBody(), make: 'BMW', model: 'M4' });

    const viewerToken = await getViewerToken();
    const res = await request(app)
      .get('/api/v1/vehicles?make=Toyota')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    const vehicles = res.body.data.vehicles as Array<{ make: string }>;
    expect(vehicles.every((v) => v.make === 'Toyota')).toBe(true);
  });

  it('filters by category', async () => {
    const adminToken = await getTokenForRole('ADMIN');

    await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validVehicleBody(), category: 'SUV', model: 'Explorer' });

    await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validVehicleBody(), category: 'SEDAN', model: 'Camry' });

    const viewerToken = await getViewerToken();
    const res = await request(app)
      .get('/api/v1/vehicles?category=SUV')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    const vehicles = res.body.data.vehicles as Array<{ category: string }>;
    expect(vehicles.every((v) => v.category === 'SUV')).toBe(true);
  });

  it('filters by price range', async () => {
    const adminToken = await getTokenForRole('ADMIN');

    await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validVehicleBody(), price: '15000.00', model: 'Cheap' });

    await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validVehicleBody(), price: '80000.00', model: 'Expensive' });

    const viewerToken = await getViewerToken();
    const res = await request(app)
      .get('/api/v1/vehicles?minPrice=20000&maxPrice=50000')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    const vehicles = res.body.data.vehicles as Array<{ price: string }>;
    vehicles.forEach((v) => {
      expect(parseFloat(v.price)).toBeGreaterThanOrEqual(20000);
      expect(parseFloat(v.price)).toBeLessThanOrEqual(50000);
    });
  });

  it('filters by year', async () => {
    const adminToken = await getTokenForRole('ADMIN');

    await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validVehicleBody(), year: 2020, model: 'Old' });

    await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validVehicleBody(), year: 2024, model: 'New' });

    const viewerToken = await getViewerToken();
    const res = await request(app)
      .get('/api/v1/vehicles?year=2024')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    const vehicles = res.body.data.vehicles as Array<{ year: number }>;
    expect(vehicles.every((v) => v.year === 2024)).toBe(true);
  });
});

// ===========================================================================
// GET /api/v1/vehicles/:id — Get One Vehicle
// ===========================================================================

describe('GET /api/v1/vehicles/:id', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/vehicles/any-id');
    expect(res.status).toBe(401);
  });

  it('returns 200 with vehicle data when found', async () => {
    const adminToken = await getTokenForRole('ADMIN');

    // Create a vehicle first
    const createRes = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validVehicleBody());

    const vehicleId = (createRes.body.data as { vehicle: { id: string } }).vehicle.id;

    const viewerToken = await getViewerToken();
    const res = await request(app)
      .get(`/api/v1/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'success',
      data: {
        vehicle: {
          id:   vehicleId,
          make: 'Toyota',
        },
      },
    });
  });

  it('returns 404 when vehicle does not exist', async () => {
    const viewerToken = await getViewerToken();

    const res = await request(app)
      .get('/api/v1/vehicles/nonexistent-id-000')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ status: 'fail', statusCode: 404 });
  });
});

// ===========================================================================
// PATCH /api/v1/vehicles/:id — Update Vehicle
// ===========================================================================

describe('PATCH /api/v1/vehicles/:id', () => {
  async function createVehicle(token: string): Promise<string> {
    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(validVehicleBody());
    return (res.body.data as { vehicle: { id: string } }).vehicle.id;
  }

  it('returns 401 without token', async () => {
    const res = await request(app)
      .patch('/api/v1/vehicles/any-id')
      .send({ price: '30000.00' });
    expect(res.status).toBe(401);
  });

  it('returns 200 with updated vehicle when called by ADMIN', async () => {
    const adminToken = await getTokenForRole('ADMIN');
    const id = await createVehicle(adminToken);

    const res = await request(app)
      .patch(`/api/v1/vehicles/${id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: '31000.00', color: 'Pearl White' });

    expect(res.status).toBe(200);
    expect(res.body.data.vehicle.price).toBe('31000.00');
    expect(res.body.data.vehicle.color).toBe('Pearl White');
  });

  it('returns 200 on partial update when called by STAFF', async () => {
    const adminToken = await getTokenForRole('ADMIN');
    const staffToken = await getTokenForRole('STAFF');
    const id = await createVehicle(adminToken);

    const res = await request(app)
      .patch(`/api/v1/vehicles/${id}`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ quantity: 10 });

    expect(res.status).toBe(200);
    expect(res.body.data.vehicle.quantity).toBe(10);
  });

  it('returns 403 when called by VIEWER', async () => {
    const adminToken   = await getTokenForRole('ADMIN');
    const viewerToken  = await getViewerToken();
    const id           = await createVehicle(adminToken);

    const res = await request(app)
      .patch(`/api/v1/vehicles/${id}`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ price: '30000.00' });

    expect(res.status).toBe(403);
  });

  it('returns 404 when vehicle does not exist', async () => {
    const adminToken = await getTokenForRole('ADMIN');

    const res = await request(app)
      .patch('/api/v1/vehicles/nonexistent-id-000')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: '30000.00' });

    expect(res.status).toBe(404);
  });
});

// ===========================================================================
// DELETE /api/v1/vehicles/:id — Delete Vehicle (soft)
// ===========================================================================

describe('DELETE /api/v1/vehicles/:id', () => {
  async function createVehicle(token: string): Promise<string> {
    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(validVehicleBody());
    return (res.body.data as { vehicle: { id: string } }).vehicle.id;
  }

  it('returns 401 without token', async () => {
    const res = await request(app).delete('/api/v1/vehicles/any-id');
    expect(res.status).toBe(401);
  });

  it('returns 204 on successful soft-delete by ADMIN', async () => {
    const adminToken = await getTokenForRole('ADMIN');
    const id = await createVehicle(adminToken);

    const res = await request(app)
      .delete(`/api/v1/vehicles/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
  });

  it('soft-deleted vehicle is no longer returned in GET list', async () => {
    const adminToken = await getTokenForRole('ADMIN');
    const id = await createVehicle(adminToken);

    await request(app)
      .delete(`/api/v1/vehicles/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    // Confirm 404 on direct lookup
    const getRes = await request(app)
      .get(`/api/v1/vehicles/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(getRes.status).toBe(404);
  });

  it('returns 403 when called by STAFF', async () => {
    const adminToken = await getTokenForRole('ADMIN');
    const staffToken = await getTokenForRole('STAFF');
    const id = await createVehicle(adminToken);

    const res = await request(app)
      .delete(`/api/v1/vehicles/${id}`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(403);
  });

  it('returns 403 when called by VIEWER', async () => {
    const adminToken  = await getTokenForRole('ADMIN');
    const viewerToken = await getViewerToken();
    const id          = await createVehicle(adminToken);

    const res = await request(app)
      .delete(`/api/v1/vehicles/${id}`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(403);
  });

  it('returns 404 when vehicle does not exist', async () => {
    const adminToken = await getTokenForRole('ADMIN');

    const res = await request(app)
      .delete('/api/v1/vehicles/nonexistent-id-000')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});
