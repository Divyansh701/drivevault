/**
 * AuthController — thin HTTP adapter for authentication use cases.
 *
 * SRP  : One job — translate HTTP ↔ use-case boundary.
 *         Parse request → call use case → format response.
 *         Zero business logic lives here.
 * DIP  : Depends on use-case interfaces, not concrete implementations.
 *         Receives RegisterUserUseCase and LoginUserUseCase via constructor.
 * OCP  : New auth endpoints (refresh, logout) add new methods; nothing changes.
 *
 * Pattern
 * ───────
 * 1. Parse & validate body with Zod (throws ZodError → 422 via errorHandler)
 * 2. Delegate to use case
 * 3. Return consistent JSON envelope: { status, data }
 *
 * Error flow
 * ──────────
 * All errors are forwarded to next() so the global errorHandler middleware
 * produces the correct JSON envelope and status code.
 * The controller never constructs error responses itself.
 */

import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema }      from '../../application/validators/auth.validator';
import { RegisterUserUseCase }              from '../../application/usecases/auth/RegisterUserUseCase';
import { LoginUserUseCase }                 from '../../application/usecases/auth/LoginUserUseCase';

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUserUseCase,
    private readonly loginUseCase:    LoginUserUseCase,
  ) {}

  // --------------------------------------------------------------------------
  // POST /auth/register
  // --------------------------------------------------------------------------

  register = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Validation — ZodError propagates to global errorHandler → 422
      const dto = registerSchema.parse(req.body);

      const result = await this.registerUseCase.execute({
        name:     dto.name,
        email:    dto.email,
        password: dto.password,
      });

      res.status(201).json({
        status: 'success',
        data:   result,
      });
    } catch (err) {
      next(err);
    }
  };

  // --------------------------------------------------------------------------
  // POST /auth/login
  // --------------------------------------------------------------------------

  login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Validation — ZodError propagates to global errorHandler → 422
      const dto = loginSchema.parse(req.body);

      const result = await this.loginUseCase.execute({
        email:    dto.email,
        password: dto.password,
      });

      res.status(200).json({
        status: 'success',
        data:   result,
      });
    } catch (err) {
      next(err);
    }
  };
}
