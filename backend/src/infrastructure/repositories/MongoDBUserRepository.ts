/**
 * MongoDBUserRepository — concrete implementation of IUserRepository using Mongoose.
 *
 * DIP compliance:
 * - Depends on the domain interface IUserRepository (lives in domain layer)
 * - Use cases depend on the interface, not this concrete class
 * - This implementation can be swapped without changing any use case code
 *
 * Soft delete behavior:
 * - All read operations exclude soft-deleted users (deletedAt !== null)
 * - softDelete() sets deletedAt timestamp instead of removing the row
 * - Maintains audit trail and allows potential recovery
 */

import {
  IUserRepository,
  UserRecord,
  CreateUserData,
  UpdateUserData,
} from '../../domain/repositories/IUserRepository';
import { UserModel, IUserDocument } from '../database/schemas';

export class MongoDBUserRepository implements IUserRepository {
  /**
   * Convert Mongoose document to domain UserRecord.
   * Removes MongoDB-specific fields and maps _id to id.
   */
  private toDomainModel(doc: IUserDocument): UserRecord {
    return {
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      password: doc.password,
      role: doc.role,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      deletedAt: doc.deletedAt,
    };
  }

  /**
   * Find an active user by their primary key.
   * Returns null when the user does not exist or has been soft-deleted.
   */
  async findById(id: string): Promise<UserRecord | null> {
    const user = await UserModel.findOne({
      _id: id,
      deletedAt: null,
    }).exec();

    return user ? this.toDomainModel(user) : null;
  }

  /**
   * Find an active user by email address (case-insensitive lookup).
   * Used during login to retrieve the stored bcrypt hash for comparison.
   * Returns null when no matching active user exists.
   */
  async findByEmail(email: string): Promise<UserRecord | null> {
    // MongoDB's email index is case-insensitive due to lowercase:true in schema
    const user = await UserModel.findOne({
      email: email.toLowerCase(),
      deletedAt: null,
    }).exec();

    return user ? this.toDomainModel(user) : null;
  }

  /**
   * Return a paginated list of active (non-deleted) users.
   *
   * @param page  1-based page number
   * @param limit Maximum records per page
   */
  async findAll(page: number, limit: number): Promise<UserRecord[]> {
    // Ensure page is at least 1
    const currentPage = Math.max(1, page);
    const skip = (currentPage - 1) * limit;

    const users = await UserModel.find({ deletedAt: null })
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .exec();

    return users.map((user) => this.toDomainModel(user));
  }

  /**
   * Count active (non-deleted) users — used for pagination metadata.
   */
  async count(): Promise<number> {
    return UserModel.countDocuments({ deletedAt: null }).exec();
  }

  /**
   * Count active users with a specific role.
   */
  async countByRole(role: string): Promise<number> {
    return UserModel.countDocuments({ role, deletedAt: null }).exec();
  }

  /**
   * Persist a new user row and return the created record.
   * The repository is responsible for nothing except the write;
   * hashing and validation happen in the use case.
   */
  async create(data: CreateUserData): Promise<UserRecord> {
    const user = new UserModel({
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      role: data.role || 'VIEWER',
      isActive: true,
      deletedAt: null,
    });

    const savedUser = await user.save();
    return this.toDomainModel(savedUser);
  }

  /**
   * Apply a partial update to an existing user.
   * Only the fields present in `data` are changed.
   */
  async update(id: string, data: UpdateUserData): Promise<UserRecord> {
    // Prepare update object - only include fields that are present
    const updateData: Partial<IUserDocument> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email.toLowerCase();
    if (data.password !== undefined) updateData.password = data.password;
    if (data.role !== undefined) updateData.role = data.role as any;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: updateData },
      { new: true, runValidators: true }
    ).exec();

    if (!updatedUser) {
      throw new Error(`User with id ${id} not found or has been deleted`);
    }

    return this.toDomainModel(updatedUser);
  }

  /**
   * Soft-delete a user by setting deletedAt to the current timestamp.
   * The row is retained in the database for audit purposes.
   */
  async softDelete(id: string): Promise<void> {
    const result = await UserModel.updateOne(
      { _id: id, deletedAt: null },
      { $set: { deletedAt: new Date() } }
    ).exec();

    if (result.matchedCount === 0) {
      throw new Error(`User with id ${id} not found or already deleted`);
    }
  }
}
