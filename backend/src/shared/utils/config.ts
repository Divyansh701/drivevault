/**
 * Application configuration — single source of truth for all env variables.
 *
 * Design decisions:
 * - Validated at startup with Zod so the app fails fast on bad config rather
 *   than crashing at runtime deep inside a request handler.
 * - Every consumer imports from this module, never from process.env directly.
 *   That keeps env access typed, testable, and easy to audit.
 */

import { z } from 'zod';
import dotenv from 'dotenv';

// Load .env into process.env (no-op if already set by the host environment)
dotenv.config();

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const envSchema = z.object({
  // Application
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  API_PREFIX: z.string().default('/api/v1'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required').refine(
    (url) => url.startsWith('mongodb://') || url.startsWith('mongodb+srv://'),
    'DATABASE_URL must be a valid MongoDB connection string (mongodb:// or mongodb+srv://)'
  ),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Bcrypt
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(14).default(10),

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:5173'),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
});

// ---------------------------------------------------------------------------
// Parse & validate — crash immediately on misconfiguration.
//
// In test environments Jest's globalSetup sets all required env vars before
// any module is imported, so this will always succeed during test runs.
// ---------------------------------------------------------------------------
const _parsed = envSchema.safeParse(process.env);

if (!_parsed.success) {
  // Use console.error so it bypasses any test-time console.log suppression
  console.error('❌ Invalid environment configuration:');
  console.error(JSON.stringify(_parsed.error.format(), null, 2));
  // eslint-disable-next-line no-process-exit
  process.exit(1);
}

const env = _parsed.data;

// ---------------------------------------------------------------------------
// Exported config object — strongly typed, readonly
// ---------------------------------------------------------------------------
export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  apiPrefix: env.API_PREFIX,
  isProduction: env.NODE_ENV === 'production',
  isDevelopment: env.NODE_ENV === 'development',
  isTest: env.NODE_ENV === 'test',

  database: {
    url: env.DATABASE_URL,
  },

  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },

  bcrypt: {
    rounds: env.BCRYPT_ROUNDS,
  },

  cors: {
    // Convert the comma-separated string into an array of trimmed origins
    origins: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
  },

  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
} as const;

export type Config = typeof config;
