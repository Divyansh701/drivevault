import { Schema, model, Document } from 'mongoose';

/**
 * User Role Enum — matches Prisma schema
 */
export enum Role {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  VIEWER = 'VIEWER',
}

/**
 * User Document Interface — extends Mongoose Document
 * Represents a user record in MongoDB
 */
export interface IUserDocument extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/**
 * User Schema Definition
 *
 * Matches the Prisma schema fields exactly:
 * - id → MongoDB _id (auto-generated ObjectId converted to string)
 * - Unique email index
 * - Soft delete support via deletedAt
 * - Timestamps managed by Mongoose
 */
const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [60, 'Password hash must be at least 60 characters (bcrypt)'],
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.VIEWER,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    // Mongoose will manage createdAt and updatedAt automatically
    timestamps: true,
    // Store documents in 'users' collection
    collection: 'users',
    // Optimize queries by not returning __v version key by default
    versionKey: false,
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Indexes for query optimization
// ─────────────────────────────────────────────────────────────────────────────

// Compound index for finding active users by role (most common query)
UserSchema.index({ role: 1, deletedAt: 1 });

// Compound index for email lookup on active users only
UserSchema.index({ email: 1, deletedAt: 1 });

// ─────────────────────────────────────────────────────────────────────────────
// Instance Methods
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if the user is soft-deleted
 */
UserSchema.methods.isDeleted = function (): boolean {
  return this.deletedAt !== null;
};

/**
 * Soft delete the user
 */
UserSchema.methods.softDelete = function (): void {
  this.deletedAt = new Date();
};

// ─────────────────────────────────────────────────────────────────────────────
// Query Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Query helper to filter out soft-deleted users
 */
(UserSchema.query as any).active = function (this: any) {
  return this.where({ deletedAt: null });
};

// ─────────────────────────────────────────────────────────────────────────────
// Export Model
// ─────────────────────────────────────────────────────────────────────────────

export const UserModel = model<IUserDocument>('User', UserSchema);
