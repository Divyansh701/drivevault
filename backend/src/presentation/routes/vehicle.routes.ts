/**
 * Vehicle routes — all vehicle endpoints under /vehicles.
 *
 * Route permissions:
 *   POST   /                → ADMIN | STAFF  (create vehicle)
 *   GET    /                → authenticated  (list vehicles, any role)
 *   GET    /search          → authenticated  (search vehicles, any role)
 *   GET    /:id             → authenticated  (get one vehicle, any role)
 *   PUT    /:id             → ADMIN | STAFF  (full replace update)
 *   PATCH  /:id             → ADMIN | STAFF  (partial update)
 *   DELETE /:id             → ADMIN only     (soft-delete vehicle)
 *   POST   /:id/purchase    → authenticated  (purchase one unit)
 *   POST   /:id/restock     → ADMIN only     (restock inventory)
 *
 * IMPORTANT: /search and /:id/purchase, /:id/restock must be registered
 * BEFORE /:id so Express does not misinterpret 'search' as an :id param.
 */

import { Router } from 'express';
import type { VehicleController }  from '../controllers/VehicleController';
import type { ITokenService }      from '../../application/interfaces/ITokenService';
import { authenticate }            from '../middleware/authenticate';
import { optionalAuthenticate }    from '../middleware/optionalAuthenticate';
import { requireRole }             from '../middleware/requireRole';

export function createVehicleRouter(
  vehicleController: VehicleController,
  tokenService: ITokenService,
): Router {
  const router = Router();

  const auth         = authenticate(tokenService);
  const optionalAuth = optionalAuthenticate(tokenService);
  const adminOnly    = requireRole('ADMIN');
  const staffUp      = requireRole('ADMIN', 'STAFF');

  // ── Static paths first (must come before /:id to avoid param conflicts) ────

  // POST /vehicles — create (ADMIN or STAFF)
  router.post('/', auth, staffUp, vehicleController.create);

  // GET /vehicles — list with filters & pagination (PUBLIC - guests can browse)
  router.get('/', optionalAuth, vehicleController.list);

  // GET /vehicles/search — dedicated search endpoint (PUBLIC - guests can search)
  router.get('/search', optionalAuth, vehicleController.search);

  // ── Parameterised paths ────────────────────────────────────────────────────

  // GET /vehicles/:id — get one (PUBLIC - guests can view details)
  router.get('/:id', optionalAuth, vehicleController.getById);

  // PUT /vehicles/:id — full replace update (ADMIN or STAFF)
  router.put('/:id', auth, staffUp, vehicleController.put);

  // PATCH /vehicles/:id — partial update (ADMIN or STAFF)
  router.patch('/:id', auth, staffUp, vehicleController.update);

  // DELETE /vehicles/:id — soft-delete (ADMIN only)
  router.delete('/:id', auth, adminOnly, vehicleController.softDelete);

  // POST /vehicles/:id/purchase — purchase one unit (AUTHENTICATED ONLY)
  router.post('/:id/purchase', auth, vehicleController.purchase);

  // POST /vehicles/:id/restock — increase inventory (ADMIN only)
  router.post('/:id/restock', auth, adminOnly, vehicleController.restock);

  return router;
}

