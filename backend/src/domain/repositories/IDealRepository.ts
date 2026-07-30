/**
 * IDealRepository — domain-layer contract for deal persistence.
 *
 * DIP compliance:
 * - Lives in the DOMAIN layer with zero infrastructure imports.
 * - Use cases depend on this interface, never on the concrete Mongoose class.
 *
 * Deal lifecycle:
 * - DRAFT      → created but not yet visible to the public
 * - PUBLISHED  → visible on the live site (and not expired)
 * - EXPIRED    → endDate has passed; treated as inactive automatically
 */

export type DealStatus = 'DRAFT' | 'PUBLISHED' | 'EXPIRED';
export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface DealRecord {
  id:            string;
  title:         string;
  description:   string | null;
  dealerId:      string;     // ID of the STAFF/ADMIN user who owns this deal
  dealerName:    string;     // Denormalised for public display without extra lookup
  vehicleId:     string | null;
  vehicleMake:   string | null;
  vehicleModel:  string | null;
  vehicleYear:   number | null;
  discountType:  DiscountType;
  discountValue: number;     // percentage (0-100) or fixed amount
  originalPrice: number;
  offerPrice:    number;
  startDate:     Date;
  endDate:       Date;
  status:        DealStatus;
  isFeatured:    boolean;
  bannerImageUrl: string | null;
  createdAt:     Date;
  updatedAt:     Date;
  deletedAt:     Date | null;
}

/** Filters for listing deals — all optional. */
export interface DealFilters {
  dealerId?: string;
  vehicleId?: string;
  status?:   DealStatus;
  isFeatured?: boolean;
  /** If true, only returns deals where now ≥ startDate and now ≤ endDate */
  activeOnly?: boolean;
}

/** Shape required to create a new deal. */
export interface CreateDealData {
  title:         string;
  description?:  string;
  dealerId:      string;
  dealerName:    string;
  vehicleId?:    string;
  vehicleMake?:  string;
  vehicleModel?: string;
  vehicleYear?:  number;
  discountType:  DiscountType;
  discountValue: number;
  originalPrice: number;
  offerPrice:    number;
  startDate:     Date;
  endDate:       Date;
  status?:       DealStatus;
  isFeatured?:   boolean;
  bannerImageUrl?: string;
}

/** Fields that may be changed on an existing deal. */
export interface UpdateDealData {
  title?:         string;
  description?:   string;
  vehicleId?:     string;
  vehicleMake?:   string;
  vehicleModel?:  string;
  vehicleYear?:   number;
  discountType?:  DiscountType;
  discountValue?: number;
  originalPrice?: number;
  offerPrice?:    number;
  startDate?:     Date;
  endDate?:       Date;
  status?:        DealStatus;
  isFeatured?:    boolean;
  bannerImageUrl?: string;
}

export interface IDealRepository {
  /**
   * Find a single deal by primary key.
   * Returns null if not found or soft-deleted.
   */
  findById(id: string): Promise<DealRecord | null>;

  /**
   * Return paginated deals matching the given filters.
   * Default sort: newest first.
   */
  findAll(
    filters: DealFilters,
    page: number,
    limit: number,
  ): Promise<DealRecord[]>;

  /**
   * Count deals matching filters (for pagination metadata).
   */
  count(filters: DealFilters): Promise<number>;

  /**
   * Return all currently active, published, non-expired deals.
   * Used by the public API — requires no authentication.
   */
  findPublicActive(limit?: number): Promise<DealRecord[]>;

  /**
   * Return active deals for a specific vehicle (for the vehicle detail page).
   */
  findActiveByVehicle(vehicleId: string): Promise<DealRecord[]>;

  /** Persist a new deal and return the created record. */
  create(data: CreateDealData): Promise<DealRecord>;

  /**
   * Apply a partial update. Only fields present in `data` are changed.
   * Ownership is enforced at the use-case layer before this is called.
   */
  update(id: string, data: UpdateDealData): Promise<DealRecord>;

  /**
   * Soft-delete a deal by setting deletedAt timestamp.
   */
  softDelete(id: string): Promise<void>;

  /**
   * Change deal status to PUBLISHED (make it live and visible to the public).
   * Validates that the deal is not expired before publishing.
   */
  publish(id: string): Promise<DealRecord>;

  /**
   * Change deal status back to DRAFT (hide from public).
   */
  unpublish(id: string): Promise<DealRecord>;
}
