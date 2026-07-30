/**
 * IPasswordHasher — contract for password hashing and verification.
 *
 * SRP  : One responsibility — hash passwords and compare them.
 * ISP  : Only two methods; consumers that only verify never need to see
 *         implementation details of how hashing works.
 * DIP  : Services depend on this interface, never on bcrypt directly.
 *         Swapping bcrypt for argon2 requires only a new implementation.
 * OCP  : New hashing strategies can be added as separate implementations
 *         without changing any service that uses this interface.
 */
export interface IPasswordHasher {
  /**
   * Hash a plaintext password.
   * Returns a self-contained hash string (includes algorithm + salt).
   * The caller should never store or log the plaintext after calling this.
   */
  hash(plaintext: string): Promise<string>;

  /**
   * Compare a plaintext password against a stored hash.
   * Returns true when they match, false otherwise.
   * Timing-safe — does not short-circuit on mismatch.
   */
  compare(plaintext: string, hash: string): Promise<boolean>;
}
