/**
 * 404 catch-all middleware.
 *
 * Placed after all routes so any request that falls through without matching
 * a route gets a clean JSON 404 instead of Express's default HTML response.
 */

import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../../shared/errors';

export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
}
