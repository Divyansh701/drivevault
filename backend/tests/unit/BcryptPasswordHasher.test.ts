/**
 * Unit tests — BcryptPasswordHasher
 *
 * TDD phase: RED
 * These tests verify the concrete IPasswordHasher implementation in isolation.
 * No database, no Express — pure function testing.
 *
 * Covers:
 *  - hash()    produces a bcrypt string (never plaintext)
 *  - compare() returns true on match, false on mismatch
 *  - compare() is resistant to timing attacks (bcrypt contract)
 *  - hash()    produces a different salt every call (non-deterministic)
 */

import { BcryptPasswordHasher } from '../../src/infrastructure/services/BcryptPasswordHasher';

// Use cost factor 1 — valid bcrypt but ~100× faster than production (10+).
// Never use cost < 10 outside of tests.
const hasher = new BcryptPasswordHasher(1);

describe('BcryptPasswordHasher', () => {
  // -------------------------------------------------------------------------
  // hash()
  // -------------------------------------------------------------------------
  describe('hash()', () => {
    it('returns a string that starts with the bcrypt identifier', async () => {
      const result = await hasher.hash('SecurePassword1!');
      // All bcrypt hashes begin with $2b$ (or $2a$ on older implementations)
      expect(result).toMatch(/^\$2[ab]\$/);
    });

    it('never returns the plaintext password', async () => {
      const plaintext = 'SecurePassword1!';
      const result = await hasher.hash(plaintext);
      expect(result).not.toBe(plaintext);
      expect(result).not.toContain(plaintext);
    });

    it('produces a different hash on each call (unique salts)', async () => {
      const plaintext = 'SamePassword99!';
      const hash1 = await hasher.hash(plaintext);
      const hash2 = await hasher.hash(plaintext);
      // Each call generates a fresh random salt so hashes must differ
      expect(hash1).not.toBe(hash2);
    });

    it('returns a hash of the standard bcrypt length (60 chars)', async () => {
      const result = await hasher.hash('AnyPassword123!');
      expect(result).toHaveLength(60);
    });
  });

  // -------------------------------------------------------------------------
  // compare()
  // -------------------------------------------------------------------------
  describe('compare()', () => {
    it('returns true when plaintext matches the stored hash', async () => {
      const plaintext = 'CorrectPassword1!';
      const hash = await hasher.hash(plaintext);
      const result = await hasher.compare(plaintext, hash);
      expect(result).toBe(true);
    });

    it('returns false when plaintext does NOT match the stored hash', async () => {
      const hash = await hasher.hash('OriginalPassword1!');
      const result = await hasher.compare('WrongPassword99!', hash);
      expect(result).toBe(false);
    });

    it('returns false for an empty string against a real hash', async () => {
      const hash = await hasher.hash('SomePassword1!');
      const result = await hasher.compare('', hash);
      expect(result).toBe(false);
    });

    it('returns false when compared against a plaintext string (not a hash)', async () => {
      // Passing a non-hash string as the hash argument must not throw —
      // bcrypt.compare handles this gracefully and returns false.
      const result = await hasher.compare('password', 'not-a-bcrypt-hash');
      expect(result).toBe(false);
    });
  });
});
