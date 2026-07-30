/**
 * Auth validators — Zod schemas for registration and login input.
 *
 * SRP  : This module owns only one concern — validating auth request bodies.
 * OCP  : New rules are added to the schema; no controller code changes.
 * DIP  : Controllers depend on these schemas, never on raw Zod internals.
 *
 * Password rules (enforced by regex):
 *   - Minimum 8 characters
 *   - At least one uppercase letter
 *   - At least one digit
 *
 * These are the minimal rules the integration tests assert on.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared field definitions (reused across schemas)
// ---------------------------------------------------------------------------

const emailField = z
  .string({ required_error: 'Email is required' })
  .email('Invalid email address')
  .toLowerCase()    // normalise before storage so lookups are case-insensitive
  .trim();

const passwordField = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one digit');

// ---------------------------------------------------------------------------
// Register schema
// ---------------------------------------------------------------------------

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(1, 'Name cannot be empty'),

  email: emailField,

  password: passwordField,
});

export type RegisterDto = z.infer<typeof registerSchema>;

// ---------------------------------------------------------------------------
// Login schema
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: emailField,

  // Login only needs presence + format — no strength check on the incoming
  // plaintext because we're comparing against a stored hash, not storing it.
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

export type LoginDto = z.infer<typeof loginSchema>;
