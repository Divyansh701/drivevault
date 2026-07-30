/**
 * Global Express error-handling middleware.
 *
 * Must have exactly four parameters (err, req, res, next) so Express
 * recognises it as an error handler, not a regular middleware.
 *
 * SRP  — formats error responses; delegates logging to ILogger.
 * OCP  — new error types are handled by registering a new ErrorHandler entry
 *         rather than modifying the existing chain.
 * DIP  — depends on ILogger abstraction, not console directly.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../../shared/errors/AppError';
import { config } from '../../shared/utils/config';
import { type ILogger, logger as defaultLogger } from '../../shared/utils/logger';

// ---------------------------------------------------------------------------
// Response envelope
// ---------------------------------------------------------------------------

interface ErrorResponse {
  status: 'error' | 'fail';
  statusCode: number;
  message: string;
  errors?: unknown;
  stack?: string;
}

// ---------------------------------------------------------------------------
// OCP: handler registry
//
// Each entry is a predicate + formatter pair. New error types are added to
// this array without touching the dispatch loop that processes them.
// ---------------------------------------------------------------------------

type ErrorFormatter = (
  err: Error,
  isProduction: boolean,
) => ErrorResponse | null;

const ERROR_FORMATTERS: ErrorFormatter[] = [
  // 1. Zod validation errors → 422 with field-level detail
  (err) => {
    if (!(err instanceof ZodError)) return null;
    return {
      status: 'fail',
      statusCode: 422,
      message: 'Validation failed',
      errors: err.flatten().fieldErrors,
    };
  },

  // 2. Known operational AppError subclasses
  (err, isProduction) => {
    if (!(err instanceof AppError) || !err.isOperational) return null;
    const response: ErrorResponse = {
      status: err.statusCode >= 500 ? 'error' : 'fail',
      statusCode: err.statusCode,
      message: err.message,
    };
    if (!isProduction) response.stack = err.stack;
    return response;
  },
];

// ---------------------------------------------------------------------------
// Factory — allows tests to inject a silent logger
// ---------------------------------------------------------------------------

export function createErrorHandler(
  injectedLogger: ILogger = defaultLogger,
  isProductionOverride?: boolean,
) {
  return function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ): void {
    const isProduction = isProductionOverride ?? config.isProduction;

    // Walk the formatter registry (OCP: closed for modification, open for extension)
    for (const format of ERROR_FORMATTERS) {
      const response = format(err, isProduction);
      if (response !== null) {
        res.status(response.statusCode).json(response);
        return;
      }
    }

    // Fallthrough: unknown / programming error — log loudly, hide details in prod
    injectedLogger.error('UNHANDLED ERROR', {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });

    const response: ErrorResponse = {
      status: 'error',
      statusCode: 500,
      message: isProduction ? 'An unexpected error occurred' : err.message,
    };

    if (!isProduction) response.stack = err.stack;

    res.status(500).json(response);
  };
}

/**
 * Default singleton middleware — uses the shared ConsoleLogger.
 * Import this in app.ts. Tests should call createErrorHandler(new NoOpLogger()).
 */
export const errorHandler = createErrorHandler();
