/**
 * Repository interface barrel export.
 *
 * Repository interfaces live in the domain layer — they define WHAT data
 * operations are needed, not HOW they are implemented.
 * Prisma implementations live in src/infrastructure/repositories/.
 *
 * Only export interfaces that exist. Commented stubs for non-existent
 * files cause confusion and trigger IDE warnings.
 */

export type {
  IUserRepository,
  UserRecord,
  CreateUserData,
  UpdateUserData,
} from './IUserRepository';

export type {
  IVehicleRepository,
  VehicleRecord,
  VehicleFilters,
  CreateVehicleData,
  UpdateVehicleData,
  DecimalString,
} from './IVehicleRepository';
