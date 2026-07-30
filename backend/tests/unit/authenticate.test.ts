/**
 * Unit tests — authenticate middleware
 *
 * TDD phase: RED — these tests will FAIL until the middleware is implemented.
 *
 * Tests the Express middleware that:
 *  1. Extracts the Bearer token from the Authorization header
 *  2. Verifies it via ITokenService
 *  3. Attaches the decoded payload to req.user
 *  4. Calls next() on success
 *  5. Calls next(UnauthorizedError) when the token is missing or invalid
 *
 * Uses unit-level mocks (no HTTP server, no Supertest).
 */

import { authenticate }    from '../../src/presentation/middleware/authenticate';
import { JwtTokenService } from '../../src/infrastructure/services/JwtTokenService';
import { UnauthorizedError } from '../../src/shared/errors';
import { mockRequest, mockResponse, mockNext } from '../helpers';
import type { TokenPayload } from '../../src/application/interfaces/ITokenService';

// ── Build a real token service with test secrets ─────────────────────────────
const ACCESS_SECRET  = 'test-access-secret-minimum-32-chars-xxx';
const REFRESH_SECRET = 'test-refresh-secret-minimum-32-chars-xxx';
const tokenService   = new JwtTokenService(ACCESS_SECRET, '1h', REFRESH_SECRET, '7d');

const viewerPayload: TokenPayload = { sub: 'user_001', email: 'viewer@test.com', role: 'VIEWER' };
const adminPayload:  TokenPayload = { sub: 'user_002', email: 'admin@test.com',  role: 'ADMIN'  };

function validViewerToken(): string { return tokenService.signAccessToken(viewerPayload); }
function validAdminToken():  string { return tokenService.signAccessToken(adminPayload);  }

// ── Middleware factory (test receives the concrete tokenService) ──────────────
// The middleware must accept an ITokenService via factory/injection.
// The actual factory import is tested below.

describe('authenticate middleware', () => {
  // --------------------------------------------------------------------------
  // Happy path
  // --------------------------------------------------------------------------
  describe('when a valid Bearer token is present', () => {
    it('calls next() with no error', () => {
      const token = validViewerToken();
      const req   = mockRequest({ headers: { authorization: `Bearer ${token}` } });
      const res   = mockResponse();
      const next  = mockNext();

      authenticate(tokenService)(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(/* no error */);
    });

    it('attaches the decoded payload to req.user', () => {
      const token = validViewerToken();
      const req   = mockRequest({ headers: { authorization: `Bearer ${token}` } });
      const res   = mockResponse();
      const next  = mockNext();

      authenticate(tokenService)(req, res, next);

      const user = (req as unknown as Record<string, unknown>).user as TokenPayload;
      expect(user.sub).toBe('user_001');
      expect(user.email).toBe('viewer@test.com');
      expect(user.role).toBe('VIEWER');
    });

    it('attaches ADMIN role correctly', () => {
      const token = validAdminToken();
      const req   = mockRequest({ headers: { authorization: `Bearer ${token}` } });
      const res   = mockResponse();
      const next  = mockNext();

      authenticate(tokenService)(req, res, next);

      const user = (req as unknown as Record<string, unknown>).user as TokenPayload;
      expect(user.role).toBe('ADMIN');
    });

    it('attaches USER role correctly', () => {
      const userToken = tokenService.signAccessToken({ sub: 'user_003', email: 'user@test.com', role: 'USER' });
      const req   = mockRequest({ headers: { authorization: `Bearer ${userToken}` } });
      const res   = mockResponse();
      const next  = mockNext();

      authenticate(tokenService)(req, res, next);

      const user = (req as unknown as Record<string, unknown>).user as TokenPayload;
      expect(user.role).toBe('USER');
    });
  });

  // --------------------------------------------------------------------------
  // Missing / malformed header
  // --------------------------------------------------------------------------
  describe('when no Authorization header is present', () => {
    it('calls next(UnauthorizedError)', () => {
      const req  = mockRequest({ headers: {} });
      const res  = mockResponse();
      const next = mockNext();

      authenticate(tokenService)(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('uses the message "No token provided"', () => {
      const req  = mockRequest({ headers: {} });
      const res  = mockResponse();
      const next = mockNext();

      authenticate(tokenService)(req, res, next);

      const err = ((next as jest.Mock).mock.calls[0] as unknown[])[0] as UnauthorizedError;
      expect(err.message).toMatch(/no token/i);
    });
  });

  describe('when Authorization header exists but has no Bearer prefix', () => {
    it('calls next(UnauthorizedError)', () => {
      const req  = mockRequest({ headers: { authorization: 'Basic dXNlcjpwYXNz' } });
      const res  = mockResponse();
      const next = mockNext();

      authenticate(tokenService)(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });

  describe('when the Bearer token is invalid', () => {
    it('calls next(UnauthorizedError) for a garbage token', () => {
      const req  = mockRequest({ headers: { authorization: 'Bearer not.a.jwt' } });
      const res  = mockResponse();
      const next = mockNext();

      authenticate(tokenService)(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('calls next(UnauthorizedError) for a tampered token', () => {
      const token   = validViewerToken();
      const tampered = token.slice(0, -5) + 'XXXXX';
      const req      = mockRequest({ headers: { authorization: `Bearer ${tampered}` } });
      const res      = mockResponse();
      const next     = mockNext();

      authenticate(tokenService)(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('calls next(UnauthorizedError) for an expired token', (done) => {
      const expiredService = new JwtTokenService(ACCESS_SECRET, '0s', REFRESH_SECRET, '7d');
      const token = expiredService.signAccessToken(viewerPayload);

      setTimeout(() => {
        const req  = mockRequest({ headers: { authorization: `Bearer ${token}` } });
        const res  = mockResponse();
        const next = mockNext();

        authenticate(tokenService)(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
        done();
      }, 20);
    });
  });
});

// ===========================================================================
// requireRole middleware (unit tests)
// ===========================================================================

import { requireRole } from '../../src/presentation/middleware/requireRole';
import { ForbiddenError } from '../../src/shared/errors';

describe('requireRole middleware', () => {
  function reqWithRole(role: string): ReturnType<typeof mockRequest> {
    const req = mockRequest();
    (req as unknown as Record<string, unknown>).user = { sub: 'u1', email: 'a@b.com', role };
    return req;
  }

  // --------------------------------------------------------------------------
  // ADMIN role
  // --------------------------------------------------------------------------
  describe('requireRole("ADMIN")', () => {
    it('calls next() when user is ADMIN', () => {
      const req  = reqWithRole('ADMIN');
      const res  = mockResponse();
      const next = mockNext();

      requireRole('ADMIN')(req, res, next);

      expect(next).toHaveBeenCalledWith(/* no error */);
    });

    it('calls next(ForbiddenError) when user is VIEWER', () => {
      const req  = reqWithRole('VIEWER');
      const res  = mockResponse();
      const next = mockNext();

      requireRole('ADMIN')(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('calls next(ForbiddenError) when user is STAFF', () => {
      const req  = reqWithRole('STAFF');
      const res  = mockResponse();
      const next = mockNext();

      requireRole('ADMIN')(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });

  // --------------------------------------------------------------------------
  // STAFF role
  // --------------------------------------------------------------------------
  describe('requireRole("STAFF")', () => {
    it('calls next() when user is STAFF', () => {
      const req  = reqWithRole('STAFF');
      const res  = mockResponse();
      const next = mockNext();

      requireRole('STAFF')(req, res, next);

      expect(next).toHaveBeenCalledWith(/* no error */);
    });

    it('calls next() when user is ADMIN (ADMIN satisfies STAFF requirement)', () => {
      const req  = reqWithRole('ADMIN');
      const res  = mockResponse();
      const next = mockNext();

      requireRole('STAFF')(req, res, next);

      expect(next).toHaveBeenCalledWith(/* no error */);
    });

    it('calls next(ForbiddenError) when user is VIEWER', () => {
      const req  = reqWithRole('VIEWER');
      const res  = mockResponse();
      const next = mockNext();

      requireRole('STAFF')(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });

  // --------------------------------------------------------------------------
  // USER role
  // --------------------------------------------------------------------------
  describe('requireRole("USER")', () => {
    it('calls next() when user is USER', () => {
      const req  = reqWithRole('USER');
      const res  = mockResponse();
      const next = mockNext();

      requireRole('USER')(req, res, next);

      expect(next).toHaveBeenCalledWith(/* no error */);
    });

    it('calls next() when user is ADMIN (ADMIN satisfies USER requirement)', () => {
      const req  = reqWithRole('ADMIN');
      const res  = mockResponse();
      const next = mockNext();

      requireRole('USER')(req, res, next);

      expect(next).toHaveBeenCalledWith(/* no error */);
    });
  });

  // --------------------------------------------------------------------------
  // No user attached (authenticate skipped or failed)
  // --------------------------------------------------------------------------
  describe('when req.user is not set', () => {
    it('calls next(UnauthorizedError)', () => {
      const req  = mockRequest(); // no .user
      const res  = mockResponse();
      const next = mockNext();

      requireRole('ADMIN')(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });

  // --------------------------------------------------------------------------
  // Multiple allowed roles
  // --------------------------------------------------------------------------
  describe('requireRole with multiple allowed roles', () => {
    it('calls next() when user matches one of several allowed roles', () => {
      const req  = reqWithRole('STAFF');
      const res  = mockResponse();
      const next = mockNext();

      requireRole('ADMIN', 'STAFF')(req, res, next);

      expect(next).toHaveBeenCalledWith(/* no error */);
    });

    it('calls next(ForbiddenError) when user matches none', () => {
      const req  = reqWithRole('VIEWER');
      const res  = mockResponse();
      const next = mockNext();

      requireRole('ADMIN', 'STAFF')(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });
});
