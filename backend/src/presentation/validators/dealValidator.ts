/**
 * Deal Validation Schemas using Zod
 *
 * Validates incoming HTTP requests for deal-related endpoints.
 * Ensures data integrity and type safety before passing to use cases.
 */

import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────────────

export const DealStatusSchema  = z.enum(['DRAFT', 'PUBLISHED', 'EXPIRED']);
export const DiscountTypeSchema = z.enum(['PERCENTAGE', 'FIXED']);

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

const OptionalUrlSchema = z
  .string()
  .url('Must be a valid URL')
  .nullable()
  .optional()
  .or(z.literal(''));

const PaginationSchema = z.object({
  page:  z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Create Deal
// ─────────────────────────────────────────────────────────────────────────────

export const CreateDealSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(100).trim(),
    description: z.string().max(1000).trim().nullable().optional(),
    vehicleId:   z.string().min(1).nullable().optional(),
    discountType:  DiscountTypeSchema,
    discountValue: z.number().min(0, 'Discount value must be non-negative'),
    originalPrice: z.number().min(0, 'Original price must be non-negative'),
    offerPrice:    z.number().min(0, 'Offer price must be non-negative'),
    startDate: z.coerce.date(),
    endDate:   z.coerce.date(),
    isFeatured:     z.boolean().optional().default(false),
    bannerImageUrl: OptionalUrlSchema,
  })
  .refine(d => d.offerPrice <= d.originalPrice, {
    message: 'Offer price cannot be higher than original price',
    path:    ['offerPrice'],
  })
  .refine(d => d.discountType !== 'PERCENTAGE' || d.discountValue <= 100, {
    message: 'Percentage discount cannot exceed 100%',
    path:    ['discountValue'],
  })
  .refine(d => d.startDate < d.endDate, {
    message: 'Start date must be before end date',
    path:    ['endDate'],
  });

// ─────────────────────────────────────────────────────────────────────────────
// Update Deal
// ─────────────────────────────────────────────────────────────────────────────

export const UpdateDealSchema = z
  .object({
    title:         z.string().min(1).max(100).trim().optional(),
    description:   z.string().max(1000).trim().nullable().optional(),
    vehicleId:     z.string().min(1).nullable().optional(),
    discountType:  DiscountTypeSchema.optional(),
    discountValue: z.number().min(0).optional(),
    originalPrice: z.number().min(0).optional(),
    offerPrice:    z.number().min(0).optional(),
    startDate:     z.coerce.date().optional(),
    endDate:       z.coerce.date().optional(),
    isFeatured:    z.boolean().optional(),
    bannerImageUrl: OptionalUrlSchema,
  })
  .refine(
    d => d.originalPrice === undefined || d.offerPrice === undefined || d.offerPrice <= d.originalPrice,
    { message: 'Offer price cannot be higher than original price', path: ['offerPrice'] },
  )
  .refine(
    d => d.discountType !== 'PERCENTAGE' || d.discountValue === undefined || d.discountValue <= 100,
    { message: 'Percentage discount cannot exceed 100%', path: ['discountValue'] },
  )
  .refine(
    d => d.startDate === undefined || d.endDate === undefined || d.startDate < d.endDate,
    { message: 'Start date must be before end date', path: ['endDate'] },
  );

// ─────────────────────────────────────────────────────────────────────────────
// Query / Param schemas
// ─────────────────────────────────────────────────────────────────────────────

export const DealIdParamSchema = z.object({
  id: z.string().min(1, 'Deal ID is required'),
});

export const ListDealsByDealerSchema = PaginationSchema.extend({
  status:     DealStatusSchema.optional(),
  vehicleId:  z.string().min(1).optional(),
  isFeatured: z.coerce.boolean().optional(),
  activeOnly: z.coerce.boolean().optional(),
  search:     z.string().trim().optional(),
});

export const ListPublicDealsSchema = z.object({
  vehicleId: z.string().min(1).optional(),
  limit:     z.coerce.number().int().min(1).max(100).optional(),
  featured:  z.coerce.boolean().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Inferred types
// ─────────────────────────────────────────────────────────────────────────────

export type CreateDealDto          = z.infer<typeof CreateDealSchema>;
export type UpdateDealDto          = z.infer<typeof UpdateDealSchema>;
export type DealIdParam            = z.infer<typeof DealIdParamSchema>;
export type ListDealsByDealerQuery = z.infer<typeof ListDealsByDealerSchema>;
export type ListPublicDealsQuery   = z.infer<typeof ListPublicDealsSchema>;
