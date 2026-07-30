/**
 * InMemoryUserRepository — in-process implementation of IUserRepository.
 *
 * Purpose
 * ───────
 * Used by the test suite and local development so the auth feature works
 * without a live PostgreSQL instance.  The PrismaUserRepository (to be
 * added later) will replace this in production without changing a single
 * line of use-case or controller code — that is DIP working correctly.
 *
 * SOLID
 * ─────
 * SRP  : One job — store and retrieve UserRecord objects in memory.
 * LSP  : Fully substitutable for IUserRepository; all contracts honoured.
 * DIP  : Application code depends only on IUserRepository; this concrete
 *        class is wired at the composition root (createApp).
 *
 * Test isolation
 * ──────────────
 * The integration tests call createApp() once per file.  The login test
 * suite registers a fresh user in beforeEach, so the store accumulates
 * entries across tests in that suite.  That is fine because:
 *   - Each beforeEach registers the same email; upsert semantics are used
 *     (create only if email not already present).
 *   - The 409 duplicate-email test relies on the store retaining data
 *     within a single test body — also correct.
 *
 * If full isolation between test files is ever needed, inject a factory
 * function (or call repository.clear()) in a globalSetup/teardown hook.
 */

import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import type {
  IUserRepository,
  UserRecord,
  CreateUserData,
  UpdateUserData,
} from '../../domain/repositories/IUserRepository';

export class InMemoryUserRepository implements IUserRepository {
  /** Primary store — keyed by id for O(1) lookups. */
  private readonly store = new Map<string, UserRecord>();

  constructor() {
    // ── Seed default accounts at startup (synchronous bcrypt) ───────────────
    // Credentials are documented in the root .env file.
    const now = new Date();

    // Admin — admin@divi.com / Admin@DIVI2024!
    this.store.set('seed-admin-001', {
      id: 'seed-admin-001',
      name: 'DIVI Administrator',
      email: 'admin@divi.com',
      password: bcrypt.hashSync('Admin@DIVI2024!', 10),
      role: 'ADMIN',
      isActive: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });

    // Staff — staff@divi.com / Staff@DIVI2024!
    this.store.set('seed-staff-001', {
      id: 'seed-staff-001',
      name: 'DIVI Staff Member',
      email: 'staff@divi.com',
      password: bcrypt.hashSync('Staff@DIVI2024!', 10),
      role: 'STAFF',
      isActive: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  // ---------------------------------------------------------------------------
  // Reads
  // ---------------------------------------------------------------------------

  async findById(id: string): Promise<UserRecord | null> {
    const user = this.store.get(id);
    if (!user || user.deletedAt !== null) return null;
    return user;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    for (const user of this.store.values()) {
      if (user.email === email.toLowerCase() && user.deletedAt === null) {
        return user;
      }
    }
    return null;
  }

  async findAll(page: number, limit: number): Promise<UserRecord[]> {
    const active = [...this.store.values()].filter((u) => u.deletedAt === null);
    const start  = (page - 1) * limit;
    return active.slice(start, start + limit);
  }

  async count(): Promise<number> {
    return [...this.store.values()].filter((u) => u.deletedAt === null).length;
  }

  async countByRole(role: string): Promise<number> {
    return [...this.store.values()].filter((u) => u.role === role && u.deletedAt === null).length;
  }

  // ---------------------------------------------------------------------------
  // Writes
  // ---------------------------------------------------------------------------

  async create(data: CreateUserData): Promise<UserRecord> {
    const now: Date = new Date();
    const record: UserRecord = {
      id:        randomUUID(),
      name:      data.name,
      email:     data.email.toLowerCase(),
      password:  data.password,
      role:      data.role ?? 'VIEWER',
      isActive:  true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    this.store.set(record.id, record);
    return record;
  }

  async update(id: string, data: UpdateUserData): Promise<UserRecord> {
    const existing = this.store.get(id);
    if (!existing) throw new Error(`User ${id} not found`);

    const updated: UserRecord = {
      ...existing,
      ...(data.name      !== undefined && { name:     data.name }),
      ...(data.email     !== undefined && { email:    data.email.toLowerCase() }),
      ...(data.password  !== undefined && { password: data.password }),
      ...(data.role      !== undefined && { role:     data.role }),
      ...(data.isActive  !== undefined && { isActive: data.isActive }),
      updatedAt: new Date(),
    };
    this.store.set(id, updated);
    return updated;
  }

  async softDelete(id: string): Promise<void> {
    const existing = this.store.get(id);
    if (existing) {
      this.store.set(id, { ...existing, deletedAt: new Date() });
    }
  }

  // ---------------------------------------------------------------------------
  // Test utility — not part of IUserRepository contract
  // ---------------------------------------------------------------------------

  /** Wipe all records.  Call this in afterEach when full test isolation matters. */
  clear(): void {
    this.store.clear();
  }
}
