/**
 * ILogger — logging abstraction for the application layer.
 *
 * DIP compliance:
 * - All production code depends on this interface, never on `console` directly.
 * - The concrete ConsoleLogger is wired in the composition root (app.ts / server.ts).
 * - Tests can inject a silent NoOpLogger to suppress output without
 *   mocking the global console object.
 *
 * SRP compliance:
 * - This module owns exactly one concern: defining the logging contract.
 */

export interface ILogger {
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, meta?: unknown): void;
  debug(message: string, meta?: unknown): void;
}

/**
 * ConsoleLogger — production implementation of ILogger.
 *
 * Writes structured JSON lines to stdout/stderr so log aggregators
 * (CloudWatch, Datadog, Splunk) can parse them without additional config.
 * In non-production environments a human-readable format is used instead.
 */
export class ConsoleLogger implements ILogger {
  private readonly isProduction: boolean;

  constructor(isProduction = process.env.NODE_ENV === 'production') {
    this.isProduction = isProduction;
  }

  info(message: string, meta?: unknown): void {
    this.write('INFO', message, meta);
  }

  warn(message: string, meta?: unknown): void {
    this.write('WARN', message, meta);
  }

  error(message: string, meta?: unknown): void {
    this.writeError('ERROR', message, meta);
  }

  debug(message: string, meta?: unknown): void {
    if (!this.isProduction) {
      this.write('DEBUG', message, meta);
    }
  }

  private write(level: string, message: string, meta?: unknown): void {
    if (this.isProduction) {
      process.stdout.write(
        JSON.stringify({ level, message, meta, ts: new Date().toISOString() }) + '\n',
      );
    } else {
      // eslint-disable-next-line no-console
      console.log(`[${level}] ${message}`, meta !== undefined ? meta : '');
    }
  }

  private writeError(level: string, message: string, meta?: unknown): void {
    if (this.isProduction) {
      process.stderr.write(
        JSON.stringify({ level, message, meta, ts: new Date().toISOString() }) + '\n',
      );
    } else {
      // eslint-disable-next-line no-console
      console.error(`[${level}] ${message}`, meta !== undefined ? meta : '');
    }
  }
}

/**
 * NoOpLogger — silent implementation for test environments.
 *
 * Inject this wherever a real logger is required but output is undesired.
 * Avoids the fragility of spying on the global console object.
 */
export class NoOpLogger implements ILogger {
  info(_message: string, _meta?: unknown): void { /* silent */ }
  warn(_message: string, _meta?: unknown): void { /* silent */ }
  error(_message: string, _meta?: unknown): void { /* silent */ }
  debug(_message: string, _meta?: unknown): void { /* silent */ }
}

/** Shared application-wide logger instance (composition root). */
export const logger: ILogger = new ConsoleLogger();
