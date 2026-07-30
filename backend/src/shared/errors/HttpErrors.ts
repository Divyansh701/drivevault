/**
 * Typed HTTP error subclasses.
 *
 * Using named subclasses instead of `new AppError('...', 404)` everywhere:
 * - Reads like English:  throw new NotFoundError('Car not found')
 * - Lets callers catch specific error types if they need to
 * - Keeps status codes in one place — never scattered across controllers
 */

import { AppError } from './AppError';

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorised') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message = 'Unprocessable entity') {
    super(message, 422);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    // isOperational = false → signals a non-recoverable error
    super(message, 500, false);
  }
}
