/**
 * optionalAuthenticate — Optional JWT authentication middleware factory.
 *
 * Unlike the standard authenticate middleware, this one allows requests to
 * proceed even without a valid token. If a token is present and valid, it
 * attaches the user to the request. If not, the request continues without
 * a user object, allowing guest browsing.
 *
 * Use Cases:
 * - Public vehicle listing pages (guests can browse, authenticated users get full access)
 * - Public vehicle detail pages (guests can view, authenticated users can interact)
 *
 * Usage:
 *   router.get('/vehicles', optionalAuthenticate(tokenService), vehicleController.list);
 *   // req.user will be defined if authenticated, undefined if guest
 */

import { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ITokenService } from '../../application/interfaces/ITokenService';

/**
 * Returns an Express middleware that optionally authenticates requests.
 * Does not throw errors if authentication fails; simply continues without user.
 *
 * @param tokenService - concrete ITokenService injected from the composition root
 */
export function optionalAuthenticate(tokenService: ITokenService): RequestHandler {
  return function optionalAuthMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction,
  ): void {
    const authHeader = req.headers.authorization;

    // ── No token provided — continue as guest ────────────────────────────────
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    // ── Extract token ─────────────────────────────────────────────────────────
    const token = authHeader.slice('Bearer '.length);

    // ── Try to verify — if successful, attach user; if not, continue as guest
    try {
      const payload = tokenService.verifyAccessToken(token);
      // Attach decoded payload so downstream handlers can read it
      (req as Request & { user: typeof payload }).user = payload;
    } catch (err) {
      // Token invalid or expired — treat as guest, don't throw error
      // This allows the request to continue without authentication
    }

    next();
  };
}
