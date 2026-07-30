/**
 * Validation utilities — Zod error formatting & shared helpers.
 *
 * SRP: Centralizes Zod error transformation across all controllers/middlewares.
 */

import { ZodError } from 'zod';

/**
 * Transforms a ZodError into a clean key-value map of field validation errors.
 * e.g. { email: "Invalid email format", password: "Password is required" }
 */
export function flattenZodErrors(error: ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (key !== undefined) {
      formatted[String(key)] = issue.message;
    }
  }
  return formatted;
}
