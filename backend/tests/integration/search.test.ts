/**
 * Integration tests — Vehicle Search (GET /api/v1/vehicles/search)
 *
 * TDD — tests are written first. Implementation must satisfy every assertion.
 *
 * Coverage:
 *  Authentication
 *    ✓ 401 without token
 *
 *  Single-field filters
 *    ✓ make  (exact match)
 *    ✓ model (exact match)
 *    ✓ category
 *    ✓ powertrain
 *    ✓ minPrice only
 *    ✓ maxPrice only
 *    ✓ minPrice + maxPrice range
 *    ✓ year (exact)
 *    ✓ status
 *
 *  Multi-field filters (combined)
 *    ✓ make + category
 *    ✓ make + minPrice + maxPrice
 *    ✓ category + powertrain
 *    ✓ year + category
 *    ✓ make + model + category + price range (all together)
 *
 *  No-results
 *    ✓ returns empty list (not 404) when no vehicles match
 *
 *  Pagination
 *    ✓ response includes page, limit, total, totalPages
 *    ✓ page=1&limit=2 returns at most 2 results
 *    ✓ page=2 returns the second page of results
 *    ✓ limit clamp — limit > 100 is rejected or capped
 *    ✓ total reflects all matching records, not just the current page
 *
 *  Sorting
 *    ✓ sortBy=price&sortOrder=asc  — ascending price
 *    ✓ sortBy=price&sortOrder=desc — descending price
 *    ✓ sortBy=year&sortOrder=asc
 *    ✓ sortBy=year&sortOrder=desc
 *    ✓ sortBy=make&sortOrder=asc   — alphabetical make
 *    ✓ sortBy=createdAt&sortOrder=desc (newest first, default behaviour)
 *    ✓ invalid sortBy field returns 422
 *    ✓ invalid sortOrder value returns 422
 *
 *  Response shape
 *    ✓ data.vehicles is an array
 *    ✓ data.pagination has page / limit / total / totalPages
 *    ✓ each vehicle has required fields (id, make, model, year, category, price, quantity)
 */

import request from 'supertest';
import { createApp } from '../../src/app';
import type { Application } from 'express';

// ---------------------------------------------------------------------------
// Isolated app — fresh in-memory store for every describe block that needs it
// ---------------------------------------------------------------------------
let app: Application;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function seedAdminToken(a: Application): Promise<string> {
  const res = await request(a)
    .post('/api/v1/test/seed-user')
    .send({
      name:     `Admin ${Date.now()}`,
      email:    `admin.${Date.now()}@search.test`,
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
      email:    `viewer.${Date.now()}@search.test`,
      password: 'TestPass1!',
    });
  return (res.body.data as { accessToken: string }).accessToken;
}

/** Create a vehicle and return the record id. */
async function addVehicle(
  a: Application,
  token: string,
  overrides: Record<string, unknown> = {},
): Promise<string> {
  const body = {
    make:       'Toyota',
    model:      'Camry',
    year:       2022,
    category:   'SEDAN',
    powertrain: 'PETROL',
    price:      '28000.00',
    quantity:   5,
    ...overrides,
  };
  const res = await request(a)
    .post('/api/v1/vehicles')
    .set('Authorization', `Bearer ${token}`)
    .send(body);
  return (res.body.data as { vehicle: { id: string } }).vehicle.id;
}

async function search(
  a: Application,
  token: string,
  params: Record<string, string | number>,
) {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();
  return request(a)
    .get(`/api/v1/vehicles/search${qs ? `?${qs}` : ''}`)
    .set('Authorization', `Bearer ${token}`);
}

// ===========================================================================
// Authentication
// ===========================================================================

describe('GET /api/v1/vehicles/search — authentication', () => {
  beforeAll(() => { app = createApp(); });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/v1/vehicles/search');
    expect(res.status).toBe(401);
  });
});

// ===========================================================================
// Single-field filters
// ===========================================================================

describe('GET /api/v1/vehicles/search — single-field filters', () => {
  let adminToken: string;
  let viewerToken: string;

  beforeAll(async () => {
    app        = createApp();
    adminToken  = await seedAdminToken(app);
    viewerToken = await seedViewerToken(app);

    // Seed a varied data set
    await addVehicle(app, adminToken, { make: 'Toyota',  model: 'Camry',     category: 'SEDAN',  powertrain: 'PETROL', price: '28000.00', year: 2022 });
    await addVehicle(app, adminToken, { make: 'Toyota',  model: 'RAV4',      category: 'SUV',    powertrain: 'HYBRID', price: '36000.00', year: 2023 });
    await addVehicle(app, adminToken, { make: 'Honda',   model: 'Civic',     category: 'SEDAN',  powertrain: 'PETROL', price: '24000.00', year: 2021 });
    await addVehicle(app, adminToken, { make: 'Honda',   model: 'CR-V',      category: 'SUV',    powertrain: 'HYBRID', price: '32000.00', year: 2023 });
    await addVehicle(app, adminToken, { make: 'BMW',     model: 'M4',        category: 'COUPE',  powertrain: 'PETROL', price: '75000.00', year: 2024 });
    await addVehicle(app, adminToken, { make: 'Tesla',   model: 'Model 3',   category: 'SEDAN',  powertrain: 'ELECTRIC', price: '42000.00', year: 2024 });
    await addVehicle(app, adminToken, { make: 'Ford',    model: 'F-150',     category: 'TRUCK',  powertrain: 'PETROL', price: '52000.00', year: 2022 });
    await addVehicle(app, adminToken, { make: 'Chevy',   model: 'Silverado', category: 'TRUCK',  powertrain: 'DIESEL', price: '55000.00', year: 2023 });
  });

  it('filters by make (exact match)', async () => {
    const res = await search(app, viewerToken, { make: 'Toyota' });
    expect(res.status).toBe(200);
    const vehicles = res.body.data.vehicles as Array<{ make: string }>;
    expect(vehicles.length).toBeGreaterThan(0);
    expect(vehicles.every((v) => v.make === 'Toyota')).toBe(true);
  });

  it('filters by model (exact match)', async () => {
    const res = await search(app, viewerToken, { model: 'Civic' });
    expect(res.status).toBe(200);
    const vehicles = res.body.data.vehicles as Array<{ model: string }>;
    expect(vehicles.length).toBeGreaterThan(0);
    expect(vehicles.every((v) => v.model === 'Civic')).toBe(true);
  });

  it('filters by category', async () => {
    const res = await search(app, viewerToken, { category: 'SUV' });
    expect(res.status).toBe(200);
    const vehicles = res.body.data.vehicles as Array<{ category: string }>;
    expect(vehicles.length).toBeGreaterThan(0);
    expect(vehicles.every((v) => v.category === 'SUV')).toBe(true);
  });

  it('filters by powertrain', async () => {
    const res = await search(app, viewerToken, { powertrain: 'ELECTRIC' });
    expect(res.status).toBe(200);
    const vehicles = res.body.data.vehicles as Array<{ powertrain: string }>;
    expect(vehicles.length).toBeGreaterThan(0);
    expect(vehicles.every((v) => v.powertrain === 'ELECTRIC')).toBe(true);
  });

  it('filters by minPrice only', async () => {
    const res = await search(app, viewerToken, { minPrice: '50000' });
    expect(res.status).toBe(200);
    const vehicles = res.body.data.vehicles as Array<{ price: string }>;
    expect(vehicles.length).toBeGreaterThan(0);
    vehicles.forEach((v) => expect(parseFloat(v.price)).toBeGreaterThanOrEqual(50000));
  });

  it('filters by maxPrice only', async () => {
    const res = await search(app, viewerToken, { maxPrice: '30000' });
    expect(res.status).toBe(200);
    const vehicles = res.body.data.vehicles as Array<{ price: string }>;
    expect(vehicles.length).toBeGreaterThan(0);
    vehicles.forEach((v) => expect(parseFloat(v.price)).toBeLessThanOrEqual(30000));
  });

  it('filters by minPrice + maxPrice range', async () => {
    const res = await search(app, viewerToken, { minPrice: '30000', maxPrice: '45000' });
    expect(res.status).toBe(200);
    const vehicles = res.body.data.vehicles as Array<{ price: string }>;
    expect(vehicles.length).toBeGreaterThan(0);
    vehicles.forEach((v) => {
      expect(parseFloat(v.price)).toBeGreaterThanOrEqual(30000);
      expect(parseFloat(v.price)).toBeLessThanOrEqual(45000);
    });
  });

  it('filters by exact year', async () => {
    const res = await search(app, viewerToken, { year: '2024' });
    expect(res.status).toBe(200);
    const vehicles = res.body.data.vehicles as Array<{ year: number }>;
    expect(vehicles.length).toBeGreaterThan(0);
    expect(vehicles.every((v) => v.year === 2024)).toBe(true);
  });
});

// ===========================================================================
// Combined / multi-field filters
// ===========================================================================

describe('GET /api/v1/vehicles/search — combined filters', () => {
  let adminToken: string;
  let viewerToken: string;

  beforeAll(async () => {
    app        = createApp();
    adminToken  = await seedAdminToken(app);
    viewerToken = await seedViewerToken(app);

    await addVehicle(app, adminToken, { make: 'Toyota', model: 'Camry',   category: 'SEDAN', powertrain: 'PETROL',   price: '28000.00', year: 2022 });
    await addVehicle(app, adminToken, { make: 'Toyota', model: 'RAV4',    category: 'SUV',   powertrain: 'HYBRID',   price: '36000.00', year: 2023 });
    await addVehicle(app, adminToken, { make: 'Honda',  model: 'Civic',   category: 'SEDAN', powertrain: 'PETROL',   price: '24000.00', year: 2021 });
    await addVehicle(app, adminToken, { make: 'Honda',  model: 'CR-V',    category: 'SUV',   powertrain: 'HYBRID',   price: '32000.00', year: 2023 });
    await addVehicle(app, adminToken, { make: 'Tesla',  model: 'Model 3', category: 'SEDAN', powertrain: 'ELECTRIC', price: '42000.00', year: 2024 });
    await addVehicle(app, adminToken, { make: 'BMW',    model: 'M4',      category: 'COUPE', powertrain: 'PETROL',   price: '75000.00', year: 2024 });
  });

  it('make + category', async () => {
    const res = await search(app, viewerToken, { make: 'Toyota', category: 'SEDAN' });
    expect(res.status).toBe(200);
    const vehicles = res.body.data.vehicles as Array<{ make: string; category: string }>;
    expect(vehicles.length).toBeGreaterThan(0);
    expect(vehicles.every((v) => v.make === 'Toyota' && v.category === 'SEDAN')).toBe(true);
  });

  it('make + minPrice + maxPrice', async () => {
    const res = await search(app, viewerToken, { make: 'Honda', minPrice: '20000', maxPrice: '35000' });
    expect(res.status).toBe(200);
    const vehicles = res.body.data.vehicles as Array<{ make: string; price: string }>;
    expect(vehicles.length).toBeGreaterThan(0);
    vehicles.forEach((v) => {
      expect(v.make).toBe('Honda');
      expect(parseFloat(v.price)).toBeGreaterThanOrEqual(20000);
      expect(parseFloat(v.price)).toBeLessThanOrEqual(35000);
    });
  });

  it('category + powertrain', async () => {
    const res = await search(app, viewerToken, { category: 'SUV', powertrain: 'HYBRID' });
    expect(res.status).toBe(200);
    const vehicles = res.body.data.vehicles as Array<{ category: string; powertrain: string }>;
    expect(vehicles.length).toBeGreaterThan(0);
    expect(vehicles.every((v) => v.category === 'SUV' && v.powertrain === 'HYBRID')).toBe(true);
  });

  it('year + category', async () => {
    const res = await search(app, viewerToken, { year: '2024', category: 'SEDAN' });
    expect(res.status).toBe(200);
    const vehicles = res.body.data.vehicles as Array<{ year: number; category: string }>;
    expect(vehicles.length).toBeGreaterThan(0);
    expect(vehicles.every((v) => v.year === 2024 && v.category === 'SEDAN')).toBe(true);
  });

  it('make + model + category + price range (all together)', async () => {
    const res = await search(app, viewerToken, {
      make: 'Toyota', model: 'Camry', category: 'SEDAN',
      minPrice: '25000', maxPrice: '30000',
    });
    expect(res.status).toBe(200);
    const vehicles = res.body.data.vehicles as Array<{
      make: string; model: string; category: string; price: string;
    }>;
    expect(vehicles.length).toBeGreaterThan(0);
    vehicles.forEach((v) => {
      expect(v.make).toBe('Toyota');
      expect(v.model).toBe('Camry');
      expect(v.category).toBe('SEDAN');
      expect(parseFloat(v.price)).toBeGreaterThanOrEqual(25000);
      expect(parseFloat(v.price)).toBeLessThanOrEqual(30000);
    });
  });

  it('returns empty list (not 404) when no vehicles match', async () => {
    const res = await search(app, viewerToken, { make: 'Lamborghini' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.vehicles)).toBe(true);
    expect(res.body.data.vehicles).toHaveLength(0);
    expect(res.body.data.pagination.total).toBe(0);
  });
});

// ===========================================================================
// Pagination
// ===========================================================================

describe('GET /api/v1/vehicles/search — pagination', () => {
  let adminToken: string;
  let viewerToken: string;

  beforeAll(async () => {
    app        = createApp();
    adminToken  = await seedAdminToken(app);
    viewerToken = await seedViewerToken(app);

    // Seed 10 vehicles of the same make so we can test pages
    for (let i = 1; i <= 10; i++) {
      await addVehicle(app, adminToken, {
        make:  'PaginationBrand',
        model: `Model-${i}`,
        price: `${20000 + i * 1000}.00`,
        year:  2020 + (i % 5),
      });
    }
  });

  it('response includes page, limit, total, totalPages', async () => {
    const res = await search(app, viewerToken, { make: 'PaginationBrand', page: '1', limit: '5' });
    expect(res.status).toBe(200);
    expect(res.body.data.pagination).toMatchObject({
      page:       1,
      limit:      5,
      total:      10,
      totalPages: 2,
    });
  });

  it('page=1 limit=3 returns exactly 3 vehicles', async () => {
    const res = await search(app, viewerToken, { make: 'PaginationBrand', page: '1', limit: '3' });
    expect(res.status).toBe(200);
    expect(res.body.data.vehicles).toHaveLength(3);
  });

  it('page=2 limit=3 returns the correct second page', async () => {
    const [page1, page2] = await Promise.all([
      search(app, viewerToken, { make: 'PaginationBrand', page: '1', limit: '3' }),
      search(app, viewerToken, { make: 'PaginationBrand', page: '2', limit: '3' }),
    ]);

    const ids1 = (page1.body.data.vehicles as Array<{ id: string }>).map((v) => v.id);
    const ids2 = (page2.body.data.vehicles as Array<{ id: string }>).map((v) => v.id);

    // Pages must be disjoint
    expect(ids1.some((id) => ids2.includes(id))).toBe(false);
  });

  it('total reflects all matching records, not just the current page', async () => {
    const res = await search(app, viewerToken, { make: 'PaginationBrand', page: '1', limit: '2' });
    expect(res.status).toBe(200);
    expect(res.body.data.pagination.total).toBe(10);
    expect(res.body.data.vehicles).toHaveLength(2);
  });

  it('returns 422 when limit exceeds 100', async () => {
    const res = await search(app, viewerToken, { make: 'PaginationBrand', page: '1', limit: '200' });
    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('limit');
  });

  it('returns 422 when page is 0', async () => {
    const res = await search(app, viewerToken, { make: 'PaginationBrand', page: '0', limit: '10' });
    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('page');
  });
});

// ===========================================================================
// Sorting
// ===========================================================================

describe('GET /api/v1/vehicles/search — sorting', () => {
  let adminToken: string;
  let viewerToken: string;

  beforeAll(async () => {
    app        = createApp();
    adminToken  = await seedAdminToken(app);
    viewerToken = await seedViewerToken(app);

    await addVehicle(app, adminToken, { make: 'SortBrand', model: 'A', price: '50000.00', year: 2020 });
    await addVehicle(app, adminToken, { make: 'SortBrand', model: 'B', price: '30000.00', year: 2022 });
    await addVehicle(app, adminToken, { make: 'SortBrand', model: 'C', price: '70000.00', year: 2019 });
    await addVehicle(app, adminToken, { make: 'SortBrand', model: 'D', price: '20000.00', year: 2024 });
    await addVehicle(app, adminToken, { make: 'SortBrand', model: 'E', price: '45000.00', year: 2021 });
  });

  it('sortBy=price&sortOrder=asc — cheapest first', async () => {
    const res = await search(app, viewerToken, { make: 'SortBrand', sortBy: 'price', sortOrder: 'asc' });
    expect(res.status).toBe(200);
    const prices = (res.body.data.vehicles as Array<{ price: string }>).map((v) => parseFloat(v.price));
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]!);
    }
  });

  it('sortBy=price&sortOrder=desc — most expensive first', async () => {
    const res = await search(app, viewerToken, { make: 'SortBrand', sortBy: 'price', sortOrder: 'desc' });
    expect(res.status).toBe(200);
    const prices = (res.body.data.vehicles as Array<{ price: string }>).map((v) => parseFloat(v.price));
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i - 1]!);
    }
  });

  it('sortBy=year&sortOrder=asc — oldest first', async () => {
    const res = await search(app, viewerToken, { make: 'SortBrand', sortBy: 'year', sortOrder: 'asc' });
    expect(res.status).toBe(200);
    const years = (res.body.data.vehicles as Array<{ year: number }>).map((v) => v.year);
    for (let i = 1; i < years.length; i++) {
      expect(years[i]).toBeGreaterThanOrEqual(years[i - 1]!);
    }
  });

  it('sortBy=year&sortOrder=desc — newest first', async () => {
    const res = await search(app, viewerToken, { make: 'SortBrand', sortBy: 'year', sortOrder: 'desc' });
    expect(res.status).toBe(200);
    const years = (res.body.data.vehicles as Array<{ year: number }>).map((v) => v.year);
    for (let i = 1; i < years.length; i++) {
      expect(years[i]).toBeLessThanOrEqual(years[i - 1]!);
    }
  });

  it('sortBy=make&sortOrder=asc — alphabetical', async () => {
    // Seed mixed makes just for this test
    const freshApp     = createApp();
    const tok          = await seedAdminToken(freshApp);
    const viewerTok    = await seedViewerToken(freshApp);

    for (const make of ['Zebra', 'Alpha', 'Mango', 'Beta']) {
      await addVehicle(freshApp, tok, { make, model: 'X' });
    }

    const res = await search(freshApp, viewerTok, { sortBy: 'make', sortOrder: 'asc' });
    expect(res.status).toBe(200);
    const makes = (res.body.data.vehicles as Array<{ make: string }>).map((v) => v.make);
    for (let i = 1; i < makes.length; i++) {
      expect(makes[i]!.localeCompare(makes[i - 1]!)).toBeGreaterThanOrEqual(0);
    }
  });

  it('sortBy=createdAt&sortOrder=desc — newest record first', async () => {
    const res = await search(app, viewerToken, { make: 'SortBrand', sortBy: 'createdAt', sortOrder: 'desc' });
    expect(res.status).toBe(200);
    const dates = (res.body.data.vehicles as Array<{ createdAt: string }>).map((v) => new Date(v.createdAt).getTime());
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i]).toBeLessThanOrEqual(dates[i - 1]!);
    }
  });

  it('returns 422 for invalid sortBy field', async () => {
    const res = await search(app, viewerToken, { sortBy: 'invalidField', sortOrder: 'asc' });
    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('sortBy');
  });

  it('returns 422 for invalid sortOrder value', async () => {
    const res = await search(app, viewerToken, { sortBy: 'price', sortOrder: 'sideways' });
    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('sortOrder');
  });
});

// ===========================================================================
// Response shape
// ===========================================================================

describe('GET /api/v1/vehicles/search — response shape', () => {
  let adminToken: string;
  let viewerToken: string;

  beforeAll(async () => {
    app        = createApp();
    adminToken  = await seedAdminToken(app);
    viewerToken = await seedViewerToken(app);
    await addVehicle(app, adminToken, { make: 'ShapeTest', model: 'Alpha' });
  });

  it('data.vehicles is an array', async () => {
    const res = await search(app, viewerToken, {});
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.vehicles)).toBe(true);
  });

  it('data.pagination contains page, limit, total, totalPages', async () => {
    const res = await search(app, viewerToken, {});
    expect(res.status).toBe(200);
    expect(res.body.data.pagination).toMatchObject({
      page:       expect.any(Number),
      limit:      expect.any(Number),
      total:      expect.any(Number),
      totalPages: expect.any(Number),
    });
  });

  it('each vehicle has the required fields', async () => {
    const res = await search(app, viewerToken, { make: 'ShapeTest' });
    expect(res.status).toBe(200);
    const vehicles = res.body.data.vehicles as Array<Record<string, unknown>>;
    expect(vehicles.length).toBeGreaterThan(0);
    for (const v of vehicles) {
      expect(v).toHaveProperty('id');
      expect(v).toHaveProperty('make');
      expect(v).toHaveProperty('model');
      expect(v).toHaveProperty('year');
      expect(v).toHaveProperty('category');
      expect(v).toHaveProperty('price');
      expect(v).toHaveProperty('quantity');
      expect(v).toHaveProperty('createdAt');
    }
  });
});
