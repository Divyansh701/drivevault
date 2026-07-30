/**
 * IVehicleRepository — domain-layer contract for vehicle persistence.
 *
 * DIP compliance:
 * - Lives in the DOMAIN layer with no Prisma or infrastructure imports.
 * - Use cases inject this interface via constructor; the concrete
 *   PrismaVehicleRepository wires in through the composition root.
 *
 * ISP compliance:
 * - Read methods (findAll, findById, count) are grouped with write methods
 *   in one interface because every current consumer needs both. If a
 *   read-only consumer emerges it can depend on IVehicleReadRepository,
 *   which can be extracted from this interface without breaking existing code.
 */

/** Decimal price is represented as string at the domain boundary to avoid
 *  importing Prisma's Decimal class into the domain layer. */
export type DecimalString = string;

export interface VehicleRecord {
  id:          string;
  make:        string;
  model:       string;
  year:        number;
  category:    string;    // matches VehicleCategory enum values
  powertrain:  string;    // matches PowertrainType enum values
  price:       DecimalString;
  quantity:    number;
  vin:         string | null;
  color:       string | null;
  mileage:     number;
  description: string | null;
  status:      string;    // matches VehicleStatus enum values
  imageUrls:   string[];
  createdAt:   Date;
  updatedAt:   Date;
  deletedAt:   Date | null;
}

/** Filters accepted by findAll — all fields are optional. */
export interface VehicleFilters {
  make?:       string;
  model?:      string;          // exact model match
  category?:   string;
  powertrain?: string;
  status?:     string;
  minPrice?:   DecimalString;
  maxPrice?:   DecimalString;
  year?:       number;          // exact year match
  minYear?:    number;
  maxYear?:    number;
}

/** Fields on which results may be sorted. */
export const SORTABLE_FIELDS = ['price', 'year', 'make', 'model', 'createdAt', 'updatedAt'] as const;
export type SortField = (typeof SORTABLE_FIELDS)[number];
export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  field: SortField;
  order: SortOrder;
}

/** Shape of data required to create a new vehicle. */
export interface CreateVehicleData {
  make:        string;
  model:       string;
  year:        number;
  category:    string;
  powertrain:  string;
  price:       DecimalString;
  quantity:    number;
  vin?:        string;
  color?:      string;
  mileage?:    number;
  description?: string;
  status?:     string;
  imageUrls?:  string[];
}

/** Fields that may be changed on an existing vehicle. */
export interface UpdateVehicleData {
  make?:        string;
  model?:       string;
  year?:        number;
  category?:    string;
  powertrain?:  string;
  price?:       DecimalString;
  quantity?:    number;
  vin?:         string;
  color?:       string;
  mileage?:     number;
  description?: string;
  status?:      string;
  imageUrls?:   string[];
}

export interface IVehicleRepository {
  /**
   * Return a filtered, paginated list of active (non-deleted) vehicles.
   *
   * @param filters Optional field-level filters
   * @param page    1-based page number
   * @param limit   Maximum records per page
   */
  findAll(
    filters: VehicleFilters,
    page: number,
    limit: number,
    sort?: SortOptions,
  ): Promise<VehicleRecord[]>;

  /**
   * Find a single active vehicle by primary key.
   * Returns null when the vehicle does not exist or has been soft-deleted.
   */
  findById(id: string): Promise<VehicleRecord | null>;

  /**
   * Find a single active vehicle by VIN.
   * Returns null when no match is found.
   */
  findByVin(vin: string): Promise<VehicleRecord | null>;

  /**
   * Count active vehicles matching the given filters.
   * Used to compute total-pages metadata for paginated responses.
   */
  count(filters: VehicleFilters): Promise<number>;

  /**
   * Persist a new vehicle and return the created record.
   */
  create(data: CreateVehicleData): Promise<VehicleRecord>;

  /**
   * Apply a partial update to an existing vehicle.
   * Only the fields present in `data` are changed.
   */
  update(id: string, data: UpdateVehicleData): Promise<VehicleRecord>;

  /**
   * Soft-delete a vehicle by setting deletedAt to the current timestamp.
   * The row is retained so sold/historical records are never lost.
   */
  softDelete(id: string): Promise<void>;
}
