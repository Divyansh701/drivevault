/**
 * BcryptPasswordHasher — concrete implementation of IPasswordHasher.
 *
 * Infrastructure layer: depends on the bcrypt library.
 * Application layer knows only the IPasswordHasher interface.
 *
 * SRP : One job — hash passwords and compare them using bcrypt.
 * LSP : Fully substitutable for IPasswordHasher — same contract, same semantics.
 * DIP : Application code imports IPasswordHasher; this class is wired in
 *        at the composition root (app.ts).
 */

import bcrypt from 'bcrypt';
import type { IPasswordHasher } from '../../application/interfaces/IPasswordHasher';

export class BcryptPasswordHasher implements IPasswordHasher {
  private readonly rounds: number;

  /**
   * @param rounds bcrypt cost factor — defaults to the value from the
   *               validated config so callers don't need to thread it in.
   *               Tests pass a lower value (e.g. 1) to keep suites fast.
   */
  constructor(rounds: number) {
    this.rounds = rounds;
  }

  /**
   * Hash a plaintext password with bcrypt.
   * The salt is generated internally and embedded in the returned hash.
   */
  async hash(plaintext: string): Promise<string> {
    return bcrypt.hash(plaintext, this.rounds);
  }

  /**
   * Timing-safe comparison of plaintext against a stored bcrypt hash.
   * Returns true only when they match.
   */
  async compare(plaintext: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plaintext, hash);
  }
}
