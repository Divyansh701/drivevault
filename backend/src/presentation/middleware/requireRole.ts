/**
 * requireRole — role-based authorization middleware factory.
 *
 * SRP  : One job — check that req.user.role is in the allowed list.
 * DIP  : Reads from req.user set by authenticate(); no token library imports.
 * OCP  : New roles are added to the call site, not to this file.
 *
 * Role hierarchy
 * ──────────────
 * ADMIN satisfies any role requirement (ADMIN >= STAFF >= VIEWER).
 * The hierarchy is expressed via the ROLE_RANK map below.
 *
 * Usage:
 *   // Require ADMIN
 *   router.post('/vehicles', authenticate(ts), requireRole('ADMIN'), handler);
 *
 *   // Require ADMIN or STAFF
 *   router.patch('/vehicles/:id', authenticate(ts), requireRole('ADMIN', 'STAFF'), handler);
 *
 *   // Any authenticated user (VIEWER, STAFF, or ADMIN)
 *   router.get('/vehicles', authenticate(ts), handler);
 */

import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ForbiddenError, UnauthorizedError }               from '../../shared/errors';
import type { VerifiedToken }                               from '../../application/interfaces/ITokenService';

/** Numeric rank — higher value = more privileged. */
const ROLE_RANK: Record<string, number> = {
  USER:     1,
  CUSTOMER: 1,
  VIEWER:   1,
  STAFF:    2,
  DEALER:   2,
  ADMIN:    3,
};

/**
 * Returns Express middleware that enforces role-based access.
 *
 * @param allowedRoles - one or more roles that are permitted to proceed.
 *   ADMIN always satisfies a STAFF requirement due to hierarchy.
 *   Pass multiple roles to express OR semantics: requireRole('ADMIN', 'STAFF').
 */
export function requireRole(...allowedRoles: string[]): RequestHandler {
  return function roleMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction,
  ): void {
    const user = (req as Request & { user?: VerifiedToken }).user;

    // authenticate() must run before requireRole()
    if (!user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    const userRank = ROLE_RANK[user.role] ?? 0;

    // Passes if the user's rank is >= the rank of ANY allowed role
    const permitted = allowedRoles.some(
      (allowed) => userRank >= (ROLE_RANK[allowed] ?? Infinity),
    );

    if (!permitted) {
      next(
        new ForbiddenError(
          `Role ${user.role} is not authorised to perform this action`,
        ),
      );
      return;
    }

    next();
  };
}
