/**
 * HTTP server entry point.
 *
 * This file does exactly three things:
 * 1. Creates the Express app.
 * 2. Starts listening on the configured port.
 * 3. Registers graceful-shutdown handlers for SIGTERM / SIGINT.
 *
 * Nothing business-logic-related lives here — that belongs in app.ts or
 * deeper in the architecture.
 */

import { createApp } from './app';
import { config } from './shared/utils/config';
import { logger } from './shared/utils/logger';
import { mongoDBClient } from './infrastructure/database/mongodb.client';

// Connect to MongoDB before starting the server.
async function startServer() {
  try {
    await mongoDBClient.connect();
    logger.info('MongoDB connection established');
  } catch (error) {
    logger.error('Failed to start server:', { error });
    process.exit(1);
  }

  const app = createApp();
  const server = app.listen(config.port, () => {
    logger.info(`Server running on http://localhost:${config.port}`, {
      apiPrefix: config.apiPrefix,
      environment: config.nodeEnv,
    });
  });

  // ---------------------------------------------------------------------------
  // Graceful shutdown
  // ---------------------------------------------------------------------------

  async function shutdown(signal: string): Promise<void> {
    logger.warn(`Received ${signal}. Shutting down gracefully...`);

    server.close(async () => {
      logger.info('HTTP server closed.');

      try {
        await mongoDBClient.disconnect();
        logger.info('MongoDB connection closed.');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', { error });
        process.exit(1);
      }
    });

    // Force-exit after 10 s if graceful shutdown stalls
    setTimeout(() => {
      logger.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10_000).unref();
  }

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  return server;
}

// Start the server
const serverPromise = startServer();

// Catch unhandled promise rejections — log and exit
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled rejection:', { reason });
  process.exit(1);
});

export default serverPromise;
