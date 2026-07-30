/**
 * Auth routes — POST /auth/register  and  POST /auth/login
 *
 * SRP  : This file owns one concern — declaring auth HTTP endpoints and
 *         binding them to controller methods.
 * DIP  : Receives a fully-constructed AuthController via factory parameter
 *         so the route file never instantiates any concrete class.
 *
 * Usage (in routes/index.ts):
 *   import { createAuthRouter } from './auth.routes';
 *   router.use('/auth', createAuthRouter(authController));
 */

import { Router }         from 'express';
import { AuthController } from '../controllers/AuthController';

export function createAuthRouter(controller: AuthController): Router {
  const router = Router();

  /**
   * POST /auth/register
   * Body: { name, email, password }
   * Returns 201 { status, data: { user, accessToken, refreshToken } }
   */
  router.post('/register', controller.register);

  /**
   * POST /auth/login
   * Body: { email, password }
   * Returns 200 { status, data: { user, accessToken, refreshToken } }
   */
  router.post('/login', controller.login);

  return router;
}
