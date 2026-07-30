/**
 * HTTP request logger middleware.
 *
 * Uses morgan with different formats per environment:
 * - development: `dev` format — colourised, concise, great for local work
 * - production:  `combined` Apache-style — all fields, suitable for log aggregators
 * - test:        silent — no log noise during test runs
 */

import morgan, { StreamOptions } from 'morgan';
import { config } from '../../shared/utils/config';
import { logger } from '../../shared/utils/logger';

// Route morgan output through structured logger so log format is unified
const stream: StreamOptions = {
  write: (message: string) => logger.info(message.trimEnd()),
};

// Skip logging in test environment
const skip = (): boolean => config.isTest;

const format = config.isProduction ? 'combined' : 'dev';

export const requestLogger = morgan(format, { stream, skip });
