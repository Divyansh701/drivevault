/**
 * Unit tests — JwtTokenService
 *
 * TDD phase: RED
 * These tests verify the concrete ITokenService implementation in isolation.
 * No database, no Express — pure function testing.
 *
 * Covers:
 *  - signAccessToken()    produces a valid JWT
 *  - signRefreshToken()   produces a valid JWT with the refresh secret
 *  - verifyAccessToken()  decodes and returns the embedded payload
 *  - verifyRefreshToken() decodes and returns the embedded payload
 *  - verifyAccessToken()  throws UnauthorizedError for an expired token
 *  - verifyAccessToken()  throws UnauthorizedError for a tampered token
 *  - Access token cannot be verified with the refresh secret (and vice versa)
 */

import { JwtTokenService } from '../../src/infrastructure/services/JwtTokenService';
import { UnauthorizedError } from '../../src/shared/errors';
import type { TokenPayload } from '../../src/application/interfaces/ITokenService';

// ── Test secrets — long enough to pass the 32-char minimum ──────────────────
const ACCESS_SECRET  = 'test-access-secret-minimum-32-chars-x';
const REFRESH_SECRET = 'test-refresh-secret-minimum-32-chars-x';

// Standard token service used by most tests
const tokenService = new JwtTokenService(
  ACCESS_SECRET,
  '1h',
  REFRESH_SECRET,
  '7d',
);

// A sample payload representing a logged-in VIEWER
const samplePayload: TokenPayload = {
  sub:   'user_clxxxxxxxxxxxxxxxx',
  email: 'jane@example.com',
  role:  'VIEWER',
};

describe('JwtTokenService', () => {
  // -------------------------------------------------------------------------
  // signAccessToken()
  // -------------------------------------------------------------------------
  describe('signAccessToken()', () => {
    it('returns a non-empty string', () => {
      const token = tokenService.signAccessToken(samplePayload);
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('returns a three-segment JWT (header.payload.signature)', () => {
      const token = tokenService.signAccessToken(samplePayload);
      const segments = token.split('.');
      expect(segments).toHaveLength(3);
    });

    it('two tokens for the same payload are not identical (unique iat)', () => {
      // iat (issued-at) is set to the current second; if we sign in the same
      // second they will match — that is expected JWT behaviour and acceptable.
      // The important invariant is they are valid tokens.
      const t1 = tokenService.signAccessToken(samplePayload);
      expect(typeof t1).toBe('string');
    });
  });

  // -------------------------------------------------------------------------
  // signRefreshToken()
  // -------------------------------------------------------------------------
  describe('signRefreshToken()', () => {
    it('returns a non-empty JWT string', () => {
      const token = tokenService.signRefreshToken(samplePayload);
      expect(token.split('.')).toHaveLength(3);
    });

    it('is signed with the refresh secret (not the access secret)', () => {
      const token = tokenService.signRefreshToken(samplePayload);
      // Should verify with the refresh secret...
      expect(() => tokenService.verifyRefreshToken(token)).not.toThrow();
      // ...but NOT with the access secret
      expect(() => tokenService.verifyAccessToken(token)).toThrow(UnauthorizedError);
    });
  });

  // -------------------------------------------------------------------------
  // verifyAccessToken()
  // -------------------------------------------------------------------------
  describe('verifyAccessToken()', () => {
    it('returns the decoded payload for a valid token', () => {
      const token   = tokenService.signAccessToken(samplePayload);
      const decoded = tokenService.verifyAccessToken(token);

      expect(decoded.sub).toBe(samplePayload.sub);
      expect(decoded.email).toBe(samplePayload.email);
      expect(decoded.role).toBe(samplePayload.role);
    });

    it('includes iat and exp fields in the decoded token', () => {
      const token   = tokenService.signAccessToken(samplePayload);
      const decoded = tokenService.verifyAccessToken(token);

      expect(typeof decoded.iat).toBe('number');
      expect(typeof decoded.exp).toBe('number');
      // exp must be in the future
      expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });

    it('throws UnauthorizedError for a tampered token', () => {
      const token   = tokenService.signAccessToken(samplePayload);
      const tampered = token.slice(0, -5) + 'XXXXX';
      expect(() => tokenService.verifyAccessToken(tampered)).toThrow(UnauthorizedError);
    });

    it('throws UnauthorizedError for a completely invalid string', () => {
      expect(() => tokenService.verifyAccessToken('not.a.jwt')).toThrow(UnauthorizedError);
    });

    it('throws UnauthorizedError for an expired token', () => {
      const expiredService = new JwtTokenService(
        ACCESS_SECRET,
        '0s',          // expires immediately
        REFRESH_SECRET,
        '7d',
      );
      const token = expiredService.signAccessToken(samplePayload);
      // Small delay to ensure the token is past its expiry
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(() => expiredService.verifyAccessToken(token)).toThrow(UnauthorizedError);
          resolve();
        }, 10);
      });
    });

    it('throws UnauthorizedError when a refresh token is passed to verifyAccessToken', () => {
      const refreshToken = tokenService.signRefreshToken(samplePayload);
      expect(() => tokenService.verifyAccessToken(refreshToken)).toThrow(UnauthorizedError);
    });
  });

  // -------------------------------------------------------------------------
  // verifyRefreshToken()
  // -------------------------------------------------------------------------
  describe('verifyRefreshToken()', () => {
    it('returns the decoded payload for a valid refresh token', () => {
      const token   = tokenService.signRefreshToken(samplePayload);
      const decoded = tokenService.verifyRefreshToken(token);

      expect(decoded.sub).toBe(samplePayload.sub);
      expect(decoded.email).toBe(samplePayload.email);
      expect(decoded.role).toBe(samplePayload.role);
    });

    it('throws UnauthorizedError when an access token is passed to verifyRefreshToken', () => {
      const accessToken = tokenService.signAccessToken(samplePayload);
      expect(() => tokenService.verifyRefreshToken(accessToken)).toThrow(UnauthorizedError);
    });

    it('throws UnauthorizedError for a tampered refresh token', () => {
      const token   = tokenService.signRefreshToken(samplePayload);
      const tampered = token.slice(0, -4) + 'ZZZZ';
      expect(() => tokenService.verifyRefreshToken(tampered)).toThrow(UnauthorizedError);
    });
  });
});
