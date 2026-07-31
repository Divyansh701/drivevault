/**
 * Vehicle validators — Zod schemas for create and update input.
 *
 * SRP  : One concern — validate vehicle request bodies.
 * OCP  : New rules go in the schema; controllers never change.
 *
 * Valid enum values mirror the Prisma schema enums exactly.
 */

import { z } from 'zod';

const VEHICLE_CATEGORIES = [
  'SEDAN', 'SUV', 'TRUCK', 'HATCHBACK',
  'CONVERTIBLE', 'COUPE', 'VAN', 'MOTORCYCLE', 'SUPERCAR',
] as const;

const POWERTRAIN_TYPES = [
  'PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'PHEV', 'HYDROGEN', 'OTHER',
] as const;

const VEHICLE_STATUSES = [
  'AVAILABLE', 'RESERVED', 'SOLD', 'MAINTENANCE',
] as const;

// A valid decimal-string: optional leading digits, decimal point, digits
// e.g.  "28500.00"  "0.99"  "1000000"
const priceField = z
  .string({ required_error: 'Price is required' })
  .regex(
    /^\d+(\.\d{1,2})?$/,
    'Price must be a valid positive decimal (e.g. "28500.00")',
  );

// ---------------------------------------------------------------------------
// Create schema — all core fields required
// ---------------------------------------------------------------------------
export const createVehicleSchema = z.object({
  make: z
    .string({ required_error: 'Make is required' })
    .trim()
    .min(1, 'Make cannot be empty'),

  model: z
    .string({ required_error: 'Model is required' })
    .trim()
    .min(1, 'Model cannot be empty'),

  year: z
    .number({ required_error: 'Year is required', invalid_type_error: 'Year must be a number' })
    .int('Year must be an integer')
    .min(1886, 'Year must be 1886 or later (year of the first automobile)')
    .max(new Date().getFullYear() + 2, 'Year cannot be more than 2 years in the future'),

  category: z.enum(VEHICLE_CATEGORIES, {
    required_error:    'Category is required',
    invalid_type_error: 'Category must be a valid vehicle category',
  }),

  powertrain: z
    .enum(POWERTRAIN_TYPES, {
      required_error: 'Powertrain is required',
    })
    .default('PETROL'),

  price: priceField,

  quantity: z
    .number({ required_error: 'Quantity is required', invalid_type_error: 'Quantity must be a number' })
    .int('Quantity must be an integer')
    .min(0, 'Quantity cannot be negative')
    .default(1),

  // Optional fields
  vin:         z.string().trim().optional(),
  color:       z.string().trim().optional(),
  mileage:     z.number().int().min(0).default(0),
  description: z.string().trim().optional(),
  status:      z.enum(VEHICLE_STATUSES).default('AVAILABLE'),
  imageUrls:   z.array(z.string().url()).default([]),
});

export type CreateVehicleDto = z.infer<typeof createVehicleSchema>;

// ---------------------------------------------------------------------------
// Update schema — all fields optional (partial update / PATCH)
// ---------------------------------------------------------------------------
export const updateVehicleSchema = createVehicleSchema.partial();

export type UpdateVehicleDto = z.infer<typeof updateVehicleSchema>;

// ---------------------------------------------------------------------------
// Restock schema — quantity must be a positive integer (≥ 1)
// ---------------------------------------------------------------------------
export const restockSchema = z.object({
  quantity: z
    .number({ required_error: 'Quantity is required', invalid_type_error: 'Quantity must be a number' })
    .int('Quantity must be an integer')
    .min(1, 'Restock quantity must be at least 1'),
});

export type RestockDto = z.infer<typeof restockSchema>;

// ---------------------------------------------------------------------------
// Search / List Query Schema — validates pagination, sorting, and filters
// ---------------------------------------------------------------------------
export const searchQuerySchema = z.object({
  page: z
    .preprocess((val) => (val !== undefined ? Number(val) : 1), z.number().int().min(1, 'Page must be at least 1'))
    .default(1),

  limit: z
    .preprocess(
      (val) => (val !== undefined ? Number(val) : 10),
      z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100'),
    )
    .default(10),

  sortBy: z
    .enum(['price', 'year', 'make', 'model', 'createdAt', 'updatedAt'], {
      invalid_type_error: 'Invalid sortBy field',
    })
    .optional(),

  sortOrder: z
    .enum(['asc', 'desc'], {
      invalid_type_error: 'Invalid sortOrder direction',
    })
    .optional(),

  make:       z.string().optional(),
  model:      z.string().optional(),
  category:   z.string().optional(),
  powertrain: z.string().optional(),
  status:     z.string().optional(),
  minPrice:   z.string().optional(),
  maxPrice:   z.string().optional(),
  year:       z.preprocess((val) => (val !== undefined ? Number(val) : undefined), z.number().int().optional()),
  minYear:    z.preprocess((val) => (val !== undefined ? Number(val) : undefined), z.number().int().optional()),
  maxYear:    z.preprocess((val) => (val !== undefined ? Number(val) : undefined), z.number().int().optional()),
});

export type SearchQueryDto = z.infer<typeof searchQuerySchema>;


