/**
 * authenticate — JWT authentication middleware factory.
 *
 * SRP  : One job — extract and verify a Bearer token, attach user to request.
 * DIP  : Receives ITokenService via parameter injection; never imports
 *         JwtTokenService directly.
 * OCP  : New token strategies require only a different ITokenService
 *         implementation; this file never changes.
 *
 * Usage:
 *   router.use(authenticate(tokenService));
 *   router.get('/protected', (req, res) => {
 *     const user = req.user; // VerifiedToken
 *   });
 *
 * Express type augmentation
 * ─────────────────────────
 * req.user is added to the Express Request type via module augmentation
 * in src/types/express.d.ts so TypeScript knows the property exists.
 */

import { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ITokenService }  from '../../application/interfaces/ITokenService';
import { UnauthorizedError }   from '../../shared/errors';

/**
 * Returns an Express middleware that authenticates requests using JWTs.
 *
 * @param tokenService - concrete ITokenService injected from the composition root
 */
export function authenticate(tokenService: ITokenService): RequestHandler {
  return function authMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction,
  ): void {
    const authHeader = req.headers.authorization;

    // ── 1. Header must be present and use the Bearer scheme ──────────────────
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next(new UnauthorizedError('No token provided'));
      return;
    }

    // ── 2. Extract token ─────────────────────────────────────────────────────
    const token = authHeader.slice('Bearer '.length);

    // ── 3. Verify — JwtTokenService normalises all jwt errors to UnauthorizedError
    try {
      const payload = tokenService.verifyAccessToken(token);
      // Attach decoded payload so downstream handlers/middleware can read it
      (req as Request & { user: typeof payload }).user = payload;
      next();
    } catch (err) {
      // Re-throw as-is: verifyAccessToken already throws UnauthorizedError
      next(err);
    }
  };
}
