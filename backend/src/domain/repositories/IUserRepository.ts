/**
 * IUserRepository — domain-layer contract for user persistence.
 *
 * DIP compliance:
 * - This interface lives in the DOMAIN layer and has zero imports from
 *   Prisma, Express, or any infrastructure library.
 * - Use cases depend on this interface, never on the concrete Prisma
 *   implementation. The concrete class lives in infrastructure/.
 * - Swapping Prisma for a different ORM requires only a new implementation
 *   of this interface; no use-case code changes at all.
 *
 * ISP compliance:
 * - Only the methods that the application layer actually needs are declared.
 *   Auth-specific operations (findByEmail, updatePassword) are kept here
 *   rather than forced onto every consumer via a fat interface.
 */

export interface UserRecord {
  id:        string;
  name:      string;
  email:     string;
  password:  string;   // bcrypt hash — never expose in responses
  role:      string;   // matches Role enum values: ADMIN | STAFF | VIEWER
  isActive:  boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/** Shape of data required to create a new user. */
export interface CreateUserData {
  name:     string;
  email:    string;
  password: string;   // pre-hashed before calling the repository
  role?:    string;   // defaults to VIEWER if omitted
}

/** Fields that may be changed on an existing user. */
export interface UpdateUserData {
  name?:      string;
  email?:     string;
  password?:  string;  // pre-hashed
  role?:      string;
  isActive?:  boolean;
}

export interface IUserRepository {
  /**
   * Find an active user by their primary key.
   * Returns null when the user does not exist or has been soft-deleted.
   */
  findById(id: string): Promise<UserRecord | null>;

  /**
   * Find an active user by email address (case-insensitive lookup).
   * Used during login to retrieve the stored bcrypt hash for comparison.
   * Returns null when no matching active user exists.
   */
  findByEmail(email: string): Promise<UserRecord | null>;

  /**
   * Return a paginated list of active (non-deleted) users.
   *
   * @param page  1-based page number
   * @param limit Maximum records per page
   */
  findAll(page: number, limit: number): Promise<UserRecord[]>;

  /**
   * Count active (non-deleted) users — used for pagination metadata.
   */
  count(): Promise<number>;

  /**
   * Count active users with a specific role.
   */
  countByRole(role: string): Promise<number>;


  /**
   * Persist a new user row and return the created record.
   * The repository is responsible for nothing except the write;
   * hashing and validation happen in the use case.
   */
  create(data: CreateUserData): Promise<UserRecord>;

  /**
   * Apply a partial update to an existing user.
   * Only the fields present in `data` are changed.
   */
  update(id: string, data: UpdateUserData): Promise<UserRecord>;

  /**
   * Soft-delete a user by setting deletedAt to the current timestamp.
   * The row is retained in the database for audit purposes.
   */
  softDelete(id: string): Promise<void>;
}
