/**
 * Jest globalSetup — runs ONCE before the entire test suite, before any
 * module is imported or any test file is evaluated.
 *
 * This is the correct place to set process.env variables that config.ts
 * reads at module-evaluation time (i.e. at import, not inside a test body).
 *
 * setupFilesAfterEnv runs too late for that — it runs after the test
 * framework loads but the module registry has already been populated.
 */

export default async function globalSetup(): Promise<void> {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL =
    'postgresql://test:test@localhost:5432/car_dealership_test';
  process.env.JWT_SECRET = 'test-jwt-secret-minimum-32-characters-long-x';
  process.env.JWT_REFRESH_SECRET =
    'test-refresh-secret-minimum-32-characters-long-x';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  process.env.BCRYPT_ROUNDS = '10';
  process.env.CORS_ORIGINS = 'http://localhost:5173';
  process.env.PORT = '3000';
  process.env.API_PREFIX = '/api/v1';
}
