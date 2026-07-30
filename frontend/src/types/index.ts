// ─── Vehicle ──────────────────────────────────────────────────────────────────

export type VehicleStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'MAINTENANCE' | 'available' | 'sold' | 'reserved' | 'inactive';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  category: string;
  powertrain: string;
  price: string;           // Decimal serialised as string by backend
  quantity: number;
  vin: string | null;
  color: string | null;
  mileage: number;
  description: string | null;
  status: VehicleStatus;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleDto {
  make: string;
  model: string;
  year: number;
  category: string;
  powertrain: string;
  price: string;
  quantity: number;
  vin?: string;
  color?: string;
  mileage?: number;
  description?: string;
  imageUrls?: string[];
}

export interface UpdateVehicleDto extends Partial<CreateVehicleDto> {}

export interface RestockDto {
  quantity: number;
}

// ─── Deals ────────────────────────────────────────────────────────────────────

export type DealStatus   = 'DRAFT' | 'PUBLISHED' | 'EXPIRED';
export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface Deal {
  id:             string;
  title:          string;
  description:    string | null;
  dealerId:       string;
  dealerName:     string;
  vehicleId:      string | null;
  vehicleMake:    string | null;
  vehicleModel:   string | null;
  vehicleYear:    number | null;
  discountType:   DiscountType;
  discountValue:  number;
  originalPrice:  number;
  offerPrice:     number;
  startDate:      string;   // ISO date string from API
  endDate:        string;   // ISO date string from API
  status:         DealStatus;
  isFeatured:     boolean;
  bannerImageUrl: string | null;
  createdAt:      string;
  updatedAt:      string;
}

export interface CreateDealDto {
  title:          string;
  description?:   string | null;
  vehicleId?:     string | null;
  discountType:   DiscountType;
  discountValue:  number;
  originalPrice:  number;
  offerPrice:     number;
  startDate:      string;   // ISO date string
  endDate:        string;   // ISO date string
  isFeatured?:    boolean;
  bannerImageUrl?: string | null;
}

export interface UpdateDealDto extends Partial<CreateDealDto> {}

export interface DealQueryParams {
  page?:       number;
  limit?:      number;
  status?:     DealStatus;
  vehicleId?:  string;
  isFeatured?: boolean;
  activeOnly?: boolean;
  search?:     string;
}

export interface DealListResponse {
  deals:      Deal[];
  totalCount: number;
  pagination?: {
    currentPage:     number;
    totalPages:      number;
    hasNextPage:     boolean;
    hasPreviousPage: boolean;
  };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'STAFF' | 'DEALER' | 'VIEWER' | 'CUSTOMER';
  createdAt: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────

/** Generic single-item response: { status, data: { [key]: T } } */
export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

/** Pagination metadata returned in list endpoints */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** List response: { status, data: { vehicles: T[], pagination: PaginationMeta } } */
export interface VehicleListResponse {
  status: string;
  data: {
    vehicles: Vehicle[];
    pagination: PaginationMeta;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface VehicleQueryParams {
  page?: number;
  limit?: number;
  make?: string;
  model?: string;
  category?: string;
  powertrain?: string;
  status?: VehicleStatus;
  minPrice?: string;
  maxPrice?: string;
  minYear?: number;
  maxYear?: number;
  year?: number;
  sortBy?: 'price' | 'year' | 'make' | 'model' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// ─── Health ───────────────────────────────────────────────────────────────────

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  uptime: number;
  environment: string;
  version?: string;
}
