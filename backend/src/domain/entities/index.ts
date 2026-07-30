/**
 * Domain entities barrel export.
 *
 * Domain entities are plain TypeScript interfaces/types — zero dependencies
 * on Express, Prisma, JWT, or any other framework.
 *
 * At the current stage the schema drives persistence types (UserRecord,
 * VehicleRecord) which are defined alongside the repository interfaces.
 * Richer domain objects with behaviour (e.g. value objects, aggregates)
 * will be added here as the domain model grows.
 *
 * Stale references to Car, Brand, Category removed — those models no
 * longer exist in the schema (replaced by Vehicle).
 */

// Domain entity types will be exported here as features are implemented:
// export type { User }    from './User';
// export type { Vehicle } from './Vehicle';
