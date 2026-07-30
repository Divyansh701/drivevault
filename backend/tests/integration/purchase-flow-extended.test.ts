import request from 'supertest';
import { createApp } from '../../src/app';

describe('Purchase & Restock Status Sync Integration', () => {
  const app = createApp();
  let adminToken: string;
  let viewerToken: string;
  let vehicleId: string;

  beforeAll(async () => {
    // Register Admin via test endpoint
    const adminRes = await request(app)
      .post('/api/v1/test/seed-user')
      .send({
        name: 'Admin User',
        email: 'admin_sync@example.com',
        password: 'Password123!',
        role: 'ADMIN',
      });
    adminToken = adminRes.body.data.accessToken;

    // Register Viewer
    const viewerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Viewer User',
        email: 'viewer_sync@example.com',
        password: 'Password123!',
      });
    viewerToken = viewerRes.body.data.accessToken;

    // Create a vehicle with quantity = 1
    const createRes = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        make: 'Porsche',
        model: '911 GT3',
        year: 2024,
        category: 'COUPE',
        powertrain: 'PETROL',
        price: '185000.00',
        quantity: 1,
      });

    expect(createRes.status).toBe(201);
    vehicleId = createRes.body.data.vehicle.id;
  });

  it('updates vehicle status to SOLD when last unit is purchased', async () => {
    const purchaseRes = await request(app)
      .post(`/api/v1/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(purchaseRes.status).toBe(200);
    expect(purchaseRes.body.data.vehicle.quantity).toBe(0);
    expect(purchaseRes.body.data.vehicle.status).toBe('SOLD');
  });

  it('rejects further purchases with 409 Conflict', async () => {
    const purchaseRes = await request(app)
      .post(`/api/v1/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(purchaseRes.status).toBe(409);
    expect(purchaseRes.body.message).toContain('out of stock');
  });

  it('resets vehicle status to AVAILABLE when restocked', async () => {
    const restockRes = await request(app)
      .post(`/api/v1/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 5 });

    expect(restockRes.status).toBe(200);
    expect(restockRes.body.data.vehicle.quantity).toBe(5);
    expect(restockRes.body.data.vehicle.status).toBe('AVAILABLE');
  });

  it('supports case-insensitive search by make', async () => {
    const searchRes = await request(app)
      .get('/api/v1/vehicles?make=porsche')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(searchRes.status).toBe(200);
    expect(searchRes.body.data.vehicles.length).toBeGreaterThanOrEqual(1);
    expect(searchRes.body.data.vehicles[0].make).toBe('Porsche');
  });
});
