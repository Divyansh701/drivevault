/**
 * AppError — the single base class for all intentional application errors.
 *
 * Why extend Error?
 * - Gives us a proper stack trace.
 * - Lets middleware do `instanceof AppError` to distinguish expected errors
 *   (validation, not-found, unauthorised) from unexpected ones (bugs, DB crashes).
 *
 * Why `isOperational`?
 * - Operational = anticipated business error (400, 401, 403, 404, 409…).
 * - Non-operational = programming error or infrastructure failure → crash & restart.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Restore the prototype chain (required when extending built-ins in TS)
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture stack trace excluding the constructor call itself
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
