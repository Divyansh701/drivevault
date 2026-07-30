/**
 * ITokenService — contract for JWT generation and verification.
 *
 * SRP  : One responsibility — sign tokens and verify them.
 * ISP  : Auth use-cases only need sign + verify; nothing else leaks in.
 * DIP  : Use cases depend on this interface, never on jsonwebtoken directly.
 * OCP  : Alternative token strategies (opaque tokens, PASETO) are new
 *         implementations; no existing code changes.
 */

/** Payload embedded inside every access token. */
export interface TokenPayload {
  /** User's primary key (CUID). */
  sub: string;
  /** User's email address. */
  email: string;
  /** User's role: ADMIN | STAFF | VIEWER. */
  role: string;
}

/** Shape returned by verify() on success. */
export interface VerifiedToken extends TokenPayload {
  /** Issued-at Unix timestamp (seconds). */
  iat: number;
  /** Expiry Unix timestamp (seconds). */
  exp: number;
}

export interface ITokenService {
  /**
   * Sign an access JWT from the given payload.
   * Expiry is determined by the implementation's config (e.g. JWT_EXPIRES_IN).
   */
  signAccessToken(payload: TokenPayload): string;

  /**
   * Sign a refresh JWT from the given payload.
   * Expiry is determined by JWT_REFRESH_EXPIRES_IN.
   */
  signRefreshToken(payload: TokenPayload): string;

  /**
   * Verify and decode an access token.
   * Throws UnauthorizedError when the token is invalid or expired.
   */
  verifyAccessToken(token: string): VerifiedToken;

  /**
   * Verify and decode a refresh token.
   * Throws UnauthorizedError when the token is invalid or expired.
   */
  verifyRefreshToken(token: string): VerifiedToken;
}
