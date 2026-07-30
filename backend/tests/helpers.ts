/**
 * Shared test helpers — imported by unit and integration tests alike.
 * Keeps test files DRY without leaking helpers into production code.
 */

import type { Request, Response, NextFunction } from 'express';
import type { IUserRepository, UserRecord } from '../src/domain/repositories/IUserRepository';

// ---------------------------------------------------------------------------
// Mock Express primitives
// ---------------------------------------------------------------------------

export const mockRequest = (overrides: Partial<Request> = {}): Request =>
  ({
    body: {},
    params: {},
    query: {},
    headers: {},
    ...overrides,
  } as unknown as Request);

export const mockResponse = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  res.send   = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
};

export const mockNext = (): NextFunction =>
  jest.fn() as unknown as NextFunction;

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Auth fixtures
// ---------------------------------------------------------------------------

/**
 * Canonical valid registration body.
 * Satisfies all Zod validation rules (name, valid email, strong password).
 */
export const validRegisterBody = () => ({
  name:     'Jane Smith',
  email:    'jane.smith@example.com',
  password: 'SecurePass1!',
});

/**
 * Canonical valid login body matching the user registered by validRegisterBody.
 */
export const validLoginBody = () => ({
  email:    'jane.smith@example.com',
  password: 'SecurePass1!',
});

// ---------------------------------------------------------------------------
// Mock IUserRepository factory
// ---------------------------------------------------------------------------

/**
 * Creates a jest-mocked IUserRepository.
 *
 * All methods return sensible defaults by default.
 * Individual tests override specific methods with mockResolvedValue / mockRejectedValue.
 *
 * Usage:
 *   const userRepo = buildMockUserRepository();
 *   userRepo.findByEmail.mockResolvedValue(null);
 *
 * This factory exists so every test file gets its own clean mock instance
 * without sharing state between tests.
 */
export function buildMockUserRepository(): jest.Mocked<IUserRepository> {
  const defaultUser: UserRecord = {
    id:        'user_test_cuid_001',
    name:      'Jane Smith',
    email:     'jane.smith@example.com',
    password:  '$2b$10$hashedpasswordplaceholder000000000000000000000000000000',
    role:      'VIEWER',
    isActive:  true,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    deletedAt: null,
  };

  return {
    findById:   jest.fn().mockResolvedValue(defaultUser),
    findByEmail: jest.fn().mockResolvedValue(null),  // default: user not found
    findAll:    jest.fn().mockResolvedValue([defaultUser]),
    count:      jest.fn().mockResolvedValue(1),
    create:     jest.fn().mockResolvedValue(defaultUser),
    update:     jest.fn().mockResolvedValue(defaultUser),
    softDelete: jest.fn().mockResolvedValue(undefined),
  };
}

// ---------------------------------------------------------------------------
// JWT helpers (test-only — no signature verification)
// ---------------------------------------------------------------------------

/**
 * Decodes the payload segment of a JWT without verifying the signature.
 * Useful in tests to inspect claims returned by the auth endpoints.
 * Never use this in production code.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> {
  const base64 = token.split('.')[1];
  if (!base64) throw new Error(`Not a valid JWT: ${token}`);
  const json = Buffer.from(base64, 'base64url').toString('utf8');
  return JSON.parse(json) as Record<string, unknown>;
}
