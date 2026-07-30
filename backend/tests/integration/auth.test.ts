/**
 * Integration tests — Authentication endpoints
 *
 * TDD phase: RED
 * All tests in this file will FAIL until the auth routes, controller,
 * service, and repository are implemented.
 *
 * Endpoint contract being tested:
 *   POST /api/v1/auth/register  — create a new user account
 *   POST /api/v1/auth/login     — authenticate and receive JWTs
 *
 * These tests use Supertest against the real Express app factory.
 * The user repository is mocked so no database connection is required.
 *
 * Coverage:
 *  Registration
 *    ✓ 201 with user payload (no password field)
 *    ✓ accessToken and refreshToken present in response
 *    ✓ password is NOT returned in any response field
 *    ✓ 409 when email is already registered
 *    ✓ 422 when required fields are missing (name)
 *    ✓ 422 when email format is invalid
 *    ✓ 422 when password is too weak (< 8 chars)
 *
 *  Login
 *    ✓ 200 with accessToken + refreshToken on valid credentials
 *    ✓ 401 when email does not exist
 *    ✓ 401 when password is incorrect
 *    ✓ 422 when email is missing
 *    ✓ 422 when password is missing
 *
 *  Token integrity
 *    ✓ Returned accessToken decodes to the correct sub/email/role
 *    ✓ Returned refreshToken is a different token from the accessToken
 */

import type { Application } from 'express';
import request from 'supertest';
import { createApp } from '../../src/app';

// ---------------------------------------------------------------------------
// App factory — each describe block that needs isolation calls createApp()
// freshly so the InMemoryUserRepository starts empty.
// ---------------------------------------------------------------------------
let app: Application;

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

/** Valid registration body that satisfies all validation rules. */
const validRegisterBody = () => ({
  name:     'Jane Smith',
  email:    'jane.smith@example.com',
  password: 'SecurePass1!',
});

/** Valid login body matching the seeded user above. */
const validLoginBody = () => ({
  email:    'jane.smith@example.com',
  password: 'SecurePass1!',
});

// ---------------------------------------------------------------------------
// Helper: decode JWT payload without verifying signature
// (We only need to inspect claims, not validate cryptographic integrity here —
//  JwtTokenService.test.ts already covers signature verification.)
// ---------------------------------------------------------------------------
function decodeJwtPayload(token: string): Record<string, unknown> {
  const base64 = token.split('.')[1];
  const json   = Buffer.from(base64, 'base64url').toString('utf8');
  return JSON.parse(json) as Record<string, unknown>;
}

// ===========================================================================
// POST /api/v1/auth/register
// ===========================================================================

describe('POST /api/v1/auth/register', () => {
  // Give every register test a completely fresh app instance so the
  // InMemoryUserRepository starts empty and tests don't pollute each other.
  beforeEach(() => { app = createApp(); });

  // ── Happy path ─────────────────────────────────────────────────────────────

  it('returns 201 with the created user and tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(validRegisterBody());

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      status: 'success',
      data: {
        user: {
          name:  'Jane Smith',
          email: 'jane.smith@example.com',
          role:  'VIEWER',
        },
        accessToken:  expect.any(String),
        refreshToken: expect.any(String),
      },
    });
  });

  it('never exposes the password hash in the response', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(validRegisterBody());

    // Top-level check
    expect(res.body).not.toHaveProperty('password');
    // Nested user object check
    expect(res.body.data?.user).not.toHaveProperty('password');
    // Full body string check — plaintext must not appear anywhere
    expect(JSON.stringify(res.body)).not.toContain('SecurePass1!');
  });

  it('returns a JWT accessToken whose payload contains sub, email, and role', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(validRegisterBody());

    expect(res.status).toBe(201);
    const { accessToken } = res.body.data as { accessToken: string };
    const payload = decodeJwtPayload(accessToken);

    expect(payload).toHaveProperty('sub');
    expect(payload.email).toBe('jane.smith@example.com');
    expect(payload.role).toBe('VIEWER');
    expect(payload).toHaveProperty('iat');
    expect(payload).toHaveProperty('exp');
  });

  it('returns a refreshToken that is distinct from the accessToken', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(validRegisterBody());

    expect(res.status).toBe(201);
    const { accessToken, refreshToken } = res.body.data as {
      accessToken: string;
      refreshToken: string;
    };
    expect(accessToken).not.toBe(refreshToken);
  });

  // ── Duplicate email ─────────────────────────────────────────────────────────

  it('returns 409 when the email address is already registered', async () => {
    // First registration succeeds
    await request(app)
      .post('/api/v1/auth/register')
      .send(validRegisterBody());

    // Second registration with the same email must fail
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(validRegisterBody());

    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({
      status:     'fail',
      statusCode: 409,
    });
    expect(res.body.message).toMatch(/already/i);
  });

  // ── Validation — required fields ────────────────────────────────────────────

  it('returns 422 when name is missing', async () => {
    const { name: _name, ...body } = validRegisterBody();
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(body);

    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('name');
  });

  it('returns 422 when email is missing', async () => {
    const { email: _email, ...body } = validRegisterBody();
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(body);

    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('email');
  });

  it('returns 422 when password is missing', async () => {
    const { password: _pw, ...body } = validRegisterBody();
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(body);

    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('password');
  });

  // ── Validation — field format ───────────────────────────────────────────────

  it('returns 422 when email format is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validRegisterBody(), email: 'not-an-email' });

    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('email');
  });

  it('returns 422 when password is shorter than 8 characters', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validRegisterBody(), password: 'Sh0rt!' });

    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('password');
  });

  it('returns 422 when password has no uppercase letter', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validRegisterBody(), password: 'alllowercase1!' });

    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('password');
  });

  it('returns 422 when password has no digit', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validRegisterBody(), password: 'NoDigitsHere!' });

    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('password');
  });

  it('returns 422 when name is an empty string', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validRegisterBody(), name: '' });

    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('name');
  });

  it('returns 422 when the request body is completely empty', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({});

    expect(res.status).toBe(422);
  });
});

// ===========================================================================
// POST /api/v1/auth/login
// ===========================================================================

describe('POST /api/v1/auth/login', () => {
  // Create a fresh app and register a known user before each login test.
  // Fresh app ensures a clean InMemoryUserRepository; the register call
  // seeds the one account we need for all login scenarios.
  beforeEach(async () => {
    app = createApp();
    await request(app)
      .post('/api/v1/auth/register')
      .send(validRegisterBody());
  });

  // ── Happy path ─────────────────────────────────────────────────────────────

  it('returns 200 with accessToken and refreshToken on valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send(validLoginBody());

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'success',
      data: {
        accessToken:  expect.any(String),
        refreshToken: expect.any(String),
        user: {
          email: 'jane.smith@example.com',
          role:  'VIEWER',
        },
      },
    });
  });

  it('never exposes the password hash in the login response', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send(validLoginBody());

    expect(res.body).not.toHaveProperty('password');
    expect(res.body.data?.user).not.toHaveProperty('password');
    expect(JSON.stringify(res.body)).not.toContain('SecurePass1!');
  });

  it('returns a JWT accessToken with the correct sub, email, and role', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send(validLoginBody());

    expect(res.status).toBe(200);
    const { accessToken } = res.body.data as { accessToken: string };
    const payload = decodeJwtPayload(accessToken);

    expect(payload).toHaveProperty('sub');
    expect(payload.email).toBe('jane.smith@example.com');
    expect(payload.role).toBe('VIEWER');
    expect(payload).toHaveProperty('exp');
  });

  it('returns distinct accessToken and refreshToken', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send(validLoginBody());

    const { accessToken, refreshToken } = res.body.data as {
      accessToken: string;
      refreshToken: string;
    };
    expect(accessToken).not.toBe(refreshToken);
  });

  // ── Authentication failures ─────────────────────────────────────────────────

  it('returns 401 when the email is not registered', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'SomePass1!' });

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      status:     'fail',
      statusCode: 401,
    });
  });

  it('returns 401 when the password is incorrect', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'jane.smith@example.com', password: 'WrongPassword1!' });

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      status:     'fail',
      statusCode: 401,
    });
  });

  it('returns the same 401 message for wrong email and wrong password (no enumeration)', async () => {
    const wrongEmail = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'SomePass1!' });

    const wrongPassword = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'jane.smith@example.com', password: 'WrongPassword1!' });

    // Both errors must produce identical messages to prevent user enumeration
    expect(wrongEmail.body.message).toBe(wrongPassword.body.message);
  });

  // ── Validation ──────────────────────────────────────────────────────────────

  it('returns 422 when email is missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ password: 'SecurePass1!' });

    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('email');
  });

  it('returns 422 when password is missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'jane.smith@example.com' });

    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('password');
  });

  it('returns 422 when email format is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'bad-format', password: 'SecurePass1!' });

    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('email');
  });

  it('returns 422 when the request body is empty', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({});

    expect(res.status).toBe(422);
  });
});
