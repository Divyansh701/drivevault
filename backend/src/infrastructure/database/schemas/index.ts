/**
 * Mongoose Schema Exports
 *
 * Central export point for all database schemas and enums.
 * Import schemas and models from this file rather than directly from schema files.
 */

// User schema and types
export { UserModel, Role } from './User.schema';
export type { IUserDocument } from './User.schema';

// Vehicle schema and types
export {
  VehicleModel,
  VehicleCategory,
  PowertrainType,
  VehicleStatus,
} from './Vehicle.schema';
export type { IVehicleDocument } from './Vehicle.schema';

// Deal schema and types
export { DealModel, DealStatus, DiscountType } from './Deal.schema';
export type { IDealDocument } from './Deal.schema';