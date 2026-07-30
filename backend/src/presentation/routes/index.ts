/**
 * Root router factory — creates a fresh Router instance per call.
 *
 * WHY A FACTORY INSTEAD OF A SINGLETON ROUTER?
 * ─────────────────────────────────────────────
 * Integration tests call createApp() once per file (or per suite).
 * If we export a single shared Router, calling router.use() in createApp()
 * accumulates duplicate route registrations across test runs, causing
 * "Route already defined" warnings and unpredictable handler ordering.
 *
 * The factory pattern ensures each createApp() call gets a clean Router
 * with exactly one registration of each route.
 *
 * Usage (in app.ts — the composition root):
 *   const router = createRootRouter(authController);
 *   app.use(config.apiPrefix, router);
 */

import { Router }                from 'express';
import healthRouter              from './health.routes';
import { createAuthRouter }      from './auth.routes';
import { createVehicleRouter }   from './vehicle.routes';
import { createDealRoutes }      from './deal.routes';
import { AuthController }        from '../controllers/AuthController';
import { VehicleController }     from '../controllers/VehicleController';
import { DealController }        from '../controllers/DealController';
import { createTestRouter, TestRouterDeps } from './test.routes';
import type { ITokenService }    from '../../application/interfaces/ITokenService';

export interface RootRouterDeps extends Partial<TestRouterDeps> {
  authController:    AuthController;
  vehicleController: VehicleController;
  dealController:    DealController;
  tokenService:      ITokenService;
}

export function createRootRouter(deps: RootRouterDeps): Router {
  const router = Router();

  // ── System ────────────────────────────────────────────────────────────────
  router.use('/health', healthRouter);

  // ── Feature routes ────────────────────────────────────────────────────────
  router.use('/auth',     createAuthRouter(deps.authController));
  router.use('/vehicles', createVehicleRouter(deps.vehicleController, deps.tokenService));

  // Deal routes (public + protected) — mounted at root so they can use
  // /public/deals (public) and /deals (protected) as top-level prefixes.
  router.use('/', createDealRoutes(deps.dealController, deps.tokenService));

  // ── Test-only routes (NODE_ENV=test only) ─────────────────────────────────
  // Exposes POST /api/v1/test/seed-user for integration tests to create users
  // with explicit roles (ADMIN, STAFF, etc.) without production backdoors.
  if (process.env['NODE_ENV'] === 'test' && deps.userRepository && deps.passwordHasher && deps.tokenService) {
    router.use('/test', createTestRouter({
      userRepository: deps.userRepository,
      passwordHasher: deps.passwordHasher,
      tokenService:   deps.tokenService,
    }));
  }

  return router;
}

