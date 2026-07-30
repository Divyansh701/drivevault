/**
 * Deal Routes Configuration
 *
 * Defines HTTP routes for deal-related operations.
 * Routes are split into public (no auth) and protected (auth required) endpoints.
 *
 * Route Structure:
 * - Public: /public/deals/* (for customers browsing deals)
 * - Protected: /deals/* (for dealers managing their deals)
 *
 * Middleware:
 * - authenticate: Verifies JWT token and sets req.user
 * - optionalAuthenticate: Allows both authenticated and guest access
 */

import { Router } from 'express';
import { DealController } from '../controllers/DealController';
import type { ITokenService } from '../../application/interfaces/ITokenService';
import { authenticate } from '../middleware/authenticate';
import { optionalAuthenticate } from '../middleware/optionalAuthenticate';
import { requireRole } from '../middleware/requireRole';

export function createDealRoutes(dealController: DealController, tokenService?: ITokenService): Router {
  const router = Router();

  const auth = tokenService ? authenticate(tokenService) : (_req: any, _res: any, next: any) => next();
  const optionalAuth = tokenService ? optionalAuthenticate(tokenService) : (_req: any, _res: any, next: any) => next();
  const dealerOrAdmin = requireRole('ADMIN', 'STAFF', 'DEALER');

  // ──────────────────────────────────────────────────────────────────────────
  // PUBLIC ROUTES (no authentication required)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * GET /public/deals
   * List all active, published deals for public browsing.
   * Query params: vehicleId?, limit?, featured?
   */
  router.get('/public/deals', dealController.listPublic);

  /**
   * GET /public/deals/:id
   * Get a single deal for public viewing (only if active and published).
   */
  router.get('/public/deals/:id', dealController.getPublic);

  // ──────────────────────────────────────────────────────────────────────────
  // PROTECTED ROUTES (authentication + dealer/admin role required)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * POST /deals
   * Create a new deal (dealers only).
   * Body: CreateDealDto
   */
  router.post('/deals', auth, dealerOrAdmin, dealController.create);

  /**
   * GET /deals
   * List deals for the authenticated dealer with filtering/pagination.
   * Query params: page?, limit?, status?, vehicleId?, isFeatured?, activeOnly?, search?
   */
  router.get('/deals', auth, dealerOrAdmin, dealController.listByDealer);

  /**
   * GET /deals/:id
   * Get a single deal by ID (dealer can access own deals + public deals).
   */
  router.get('/deals/:id', optionalAuth, dealController.getById);

  /**
   * PATCH /deals/:id
   * Update an existing deal (owner only).
   * Body: UpdateDealDto (partial update)
   */
  router.patch('/deals/:id', auth, dealerOrAdmin, dealController.update);

  /**
   * DELETE /deals/:id
   * Soft delete a deal (owner only).
   */
  router.delete('/deals/:id', auth, dealerOrAdmin, dealController.delete);

  /**
   * POST /deals/:id/publish
   * Publish a deal to make it live and visible to customers.
   */
  router.post('/deals/:id/publish', auth, dealerOrAdmin, dealController.publish);

  /**
   * POST /deals/:id/unpublish
   * Unpublish a deal (set status back to DRAFT).
   */
  router.post('/deals/:id/unpublish', auth, dealerOrAdmin, dealController.unpublish);

  return router;
}

/**
 * Alternative factory function that creates routes with dependency injection.
 * Use this if you want to pass the controller instance from the composition root.
 */
export function createDealRoutesFactory() {
  return (dealController: DealController, tokenService?: ITokenService): Router => {
    return createDealRoutes(dealController, tokenService);
  };
}