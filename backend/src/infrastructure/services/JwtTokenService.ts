/**
 * JwtTokenService — concrete implementation of ITokenService.
 *
 * Infrastructure layer: depends on jsonwebtoken.
 * Application layer knows only the ITokenService interface.
 *
 * SRP : One job — sign and verify JWTs.
 * LSP : Fully substitutable for ITokenService — same contract, same error
 *        semantics (throws UnauthorizedError on invalid/expired tokens).
 * DIP : Application code imports ITokenService; this class is wired at the
 *        composition root.
 * OCP : A different token strategy (PASETO, opaque tokens) needs only a
 *        new implementation file — no change to any service or use case.
 */

import jwt from 'jsonwebtoken';
import type {
  ITokenService,
  TokenPayload,
  VerifiedToken,
} from '../../application/interfaces/ITokenService';
import { UnauthorizedError } from '../../shared/errors';

export class JwtTokenService implements ITokenService {
  constructor(
    private readonly accessSecret: string,
    private readonly accessExpiresIn: string,
    private readonly refreshSecret: string,
    private readonly refreshExpiresIn: string,
  ) {}

  // --------------------------------------------------------------------------
  // Signing
  // --------------------------------------------------------------------------

  signAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: this.accessExpiresIn,
    } as jwt.SignOptions);
  }

  signRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiresIn,
    } as jwt.SignOptions);
  }

  // --------------------------------------------------------------------------
  // Verification
  // --------------------------------------------------------------------------

  verifyAccessToken(token: string): VerifiedToken {
    return this.decode(token, this.accessSecret);
  }

  verifyRefreshToken(token: string): VerifiedToken {
    return this.decode(token, this.refreshSecret);
  }

  // --------------------------------------------------------------------------
  // Private helpers
  // --------------------------------------------------------------------------

  private decode(token: string, secret: string): VerifiedToken {
    try {
      const decoded = jwt.verify(token, secret) as VerifiedToken;
      return decoded;
    } catch (err) {
      // Normalise all JWT errors into a single UnauthorizedError so callers
      // never need to catch jsonwebtoken-specific error types.
      if (err instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token has expired');
      }
      throw new UnauthorizedError('Invalid token');
    }
  }
}
