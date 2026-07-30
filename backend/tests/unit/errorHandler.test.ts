import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../src/shared/errors/AppError';
import { createErrorHandler } from '../../src/presentation/middleware/errorHandler';
import { NoOpLogger } from '../../src/shared/utils/logger';

describe('createErrorHandler', () => {
  const createMockResponse = () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;

    return res;
  };

  it('uses an injected production flag to avoid leaking stack traces', () => {
    const handler = createErrorHandler(new NoOpLogger(), true);
    const req = {} as Request;
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;

    handler(new Error('boom'), req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        statusCode: 500,
        message: 'An unexpected error occurred',
      }),
    );
    const payload = res.json as jest.MockedFunction<typeof res.json>;
    expect(payload.mock.calls[0][0]).not.toHaveProperty('stack');
  });

  it('returns the original app error payload for operational failures', () => {
    const handler = createErrorHandler(new NoOpLogger(), true);
    const req = {} as Request;
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;

    handler(new AppError('Missing resource', 404), req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'fail',
        statusCode: 404,
        message: 'Missing resource',
      }),
    );
  });
});
