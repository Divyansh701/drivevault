/**
 * Health-check route — GET /health
 *
 * Used by load balancers, uptime monitors, and Docker HEALTHCHECK.
 * Returns 200 when the process is alive.
 *
 * Fix (C): environment value now read from the validated config singleton
 * instead of process.env directly, keeping env access centralised and typed.
 */

import { Router, Request, Response } from 'express';
import { config } from '../../shared/utils/config';

const router = Router();

router.get('/', (_req: Request, res: Response): void => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: config.nodeEnv,
  });
});

export default router;
