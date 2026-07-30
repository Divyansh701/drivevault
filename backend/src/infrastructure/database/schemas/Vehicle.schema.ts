import { Schema, model, Document } from 'mongoose';

/**
 * Vehicle Category Enum — body-style classification
 */
export enum VehicleCategory {
  SEDAN = 'SEDAN',
  SUV = 'SUV',
  TRUCK = 'TRUCK',
  HATCHBACK = 'HATCHBACK',
  CONVERTIBLE = 'CONVERTIBLE',
  COUPE = 'COUPE',
  VAN = 'VAN',
  MOTORCYCLE = 'MOTORCYCLE',
}

/**
 * Powertrain Type Enum — fuel/drive system
 */
export enum PowertrainType {
  PETROL = 'PETROL',
  DIESEL = 'DIESEL',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID',
  PHEV = 'PHEV',
  HYDROGEN = 'HYDROGEN',
  OTHER = 'OTHER',
}

/**
 * Vehicle Status Enum — lifecycle state
 */
export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  SOLD = 'SOLD',
  MAINTENANCE = 'MAINTENANCE',
}

/**
 * Vehicle Document Interface — extends Mongoose Document
 * Represents a vehicle record in MongoDB
 */
export interface IVehicleDocument extends Omit<Document, 'model'> {
  _id: string;
  make: string;
  model: string;
  year: number;
  category: VehicleCategory;
  powertrain: PowertrainType;
  price: number;
  quantity: number;
  vin: string | null;
  color: string | null;
  mileage: number;
  description: string | null;
  status: VehicleStatus;
  imageUrls: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/**
 * Vehicle Schema Definition
 *
 * Matches the Prisma schema fields exactly:
 * - price stored as Number (MongoDB handles decimal precision)
 * - Arrays for imageUrls
 * - Soft delete support via deletedAt
 * - Comprehensive indexing for search and filtering
 */
const VehicleSchema = new Schema<IVehicleDocument>(
  {
    make: {
      type: String,
      required: [true, 'Make is required'],
      trim: true,
      index: true,
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [1900, 'Year must be 1900 or later'],
      max: [2100, 'Year must be 2100 or earlier'],
      index: true,
    },
    category: {
      type: String,
      enum: Object.values(VehicleCategory),
      required: [true, 'Category is required'],
      index: true,
    },
    powertrain: {
      type: String,
      enum: Object.values(PowertrainType),
      default: PowertrainType.PETROL,
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be non-negative'],
      index: true,
      // Store with 2 decimal precision
      set: (value: number) => Math.round(value * 100) / 100,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: [0, 'Quantity must be non-negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be an integer',
      },
    },
    vin: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple null values but enforce uniqueness for non-null values
      trim: true,
      uppercase: true,
      match: [/^[A-HJ-NPR-Z0-9]{17}$/, 'VIN must be exactly 17 alphanumeric characters'],
    },
    color: {
      type: String,
      trim: true,
      default: null,
    },
    mileage: {
      type: Number,
      default: 0,
      min: [0, 'Mileage must be non-negative'],
    },
    description: {
      type: String,
      trim: true,
      default: null,
      maxlength: [5000, 'Description must not exceed 5000 characters'],
    },
    status: {
      type: String,
      enum: Object.values(VehicleStatus),
      default: VehicleStatus.AVAILABLE,
      required: true,
      index: true,
    },
    imageUrls: {
      type: [String],
      default: [],
      validate: {
        validator: function (urls: string[]) {
          return urls.every((url) => /^https?:\/\/.+/.test(url));
        },
        message: 'All image URLs must be valid HTTP/HTTPS URLs',
      },
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'vehicles',
    versionKey: false,
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Indexes for query optimization
// ─────────────────────────────────────────────────────────────────────────────

// Compound indexes for common query patterns
VehicleSchema.index({ make: 1, model: 1 });
VehicleSchema.index({ category: 1, deletedAt: 1 });
VehicleSchema.index({ powertrain: 1, deletedAt: 1 });
VehicleSchema.index({ status: 1, deletedAt: 1 });
VehicleSchema.index({ price: 1, deletedAt: 1 });
VehicleSchema.index({ year: 1, deletedAt: 1 });

// Text index for searching across make, model, and description
VehicleSchema.index({ make: 'text', model: 'text', description: 'text' });

// ─────────────────────────────────────────────────────────────────────────────
// Instance Methods
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if the vehicle is soft-deleted
 */
VehicleSchema.methods.isDeleted = function (): boolean {
  return this.deletedAt !== null;
};

/**
 * Soft delete the vehicle
 */
VehicleSchema.methods.softDelete = function (): void {
  this.deletedAt = new Date();
};

/**
 * Check if the vehicle is in stock (quantity > 0)
 */
VehicleSchema.methods.isInStock = function (): boolean {
  return this.quantity > 0;
};

/**
 * Decrement quantity (for purchases)
 */
VehicleSchema.methods.decrementQuantity = function (amount: number = 1): void {
  if (this.quantity >= amount) {
    this.quantity -= amount;
  } else {
    throw new Error(`Insufficient quantity. Available: ${this.quantity}, Requested: ${amount}`);
  }
};

/**
 * Increment quantity (for restocking)
 */
VehicleSchema.methods.incrementQuantity = function (amount: number = 1): void {
  if (amount < 0) {
    throw new Error('Restock amount must be non-negative');
  }
  this.quantity += amount;
};

// ─────────────────────────────────────────────────────────────────────────────
// Query Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Query helper to filter out soft-deleted vehicles
 */
(VehicleSchema.query as any).active = function (this: any) {
  return this.where({ deletedAt: null });
};

/**
 * Query helper to filter by availability status
 */
(VehicleSchema.query as any).available = function (this: any) {
  return this.where({ status: VehicleStatus.AVAILABLE, deletedAt: null });
};

/**
 * Query helper to filter by in-stock vehicles
 */
(VehicleSchema.query as any).inStock = function (this: any) {
  return this.where({ deletedAt: null }).gt('quantity', 0);
};

// ─────────────────────────────────────────────────────────────────────────────
// Export Model
// ─────────────────────────────────────────────────────────────────────────────

export const VehicleModel = model<IVehicleDocument>('Vehicle', VehicleSchema);
