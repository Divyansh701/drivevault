/**
 * RegisterUserUseCase — create a new user account and return auth tokens.
 *
 * SOLID
 * ─────
 * SRP  : One job — orchestrate the registration flow.
 *        Password hashing → duplicate check → persist → issue tokens.
 * DIP  : Depends on IUserRepository, IPasswordHasher, ITokenService —
 *        never on Prisma, bcrypt, or jsonwebtoken directly.
 * OCP  : New registration rules (e.g. email domain whitelist) slot in
 *        here without changing any controller or route code.
 *
 * Clean Architecture
 * ──────────────────
 * This class lives in the APPLICATION layer.  It has zero knowledge of:
 *  - Express (no Request / Response imports)
 *  - Prisma (no @prisma/client imports)
 *  - bcrypt or jsonwebtoken (accessed only through their interfaces)
 */

import type { IUserRepository }  from '../../../domain/repositories/IUserRepository';
import type { IPasswordHasher }  from '../../interfaces/IPasswordHasher';
import type { ITokenService, TokenPayload } from '../../interfaces/ITokenService';
import { ConflictError }         from '../../../shared/errors';

// ---------------------------------------------------------------------------
// DTOs — plain data shapes crossing the layer boundary
// ---------------------------------------------------------------------------

export interface RegisterInput {
  name:     string;
  email:    string;   // already lowercased by Zod schema
  password: string;   // plaintext — hashed here before storage
}

export interface AuthUserView {
  id:    string;
  name:  string;
  email: string;
  role:  string;
}

export interface RegisterOutput {
  user:         AuthUserView;
  accessToken:  string;
  refreshToken: string;
}

// ---------------------------------------------------------------------------
// Use case
// ---------------------------------------------------------------------------

export class RegisterUserUseCase {
  constructor(
    private readonly userRepo:    IUserRepository,
    private readonly hasher:      IPasswordHasher,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    // 1. Duplicate email guard
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw new ConflictError(
        `Email address ${input.email} is already registered`,
      );
    }

    // 2. Hash password before any persistence
    const hashedPassword = await this.hasher.hash(input.password);

    // 3. Persist — role defaults to VIEWER inside the repository
    const created = await this.userRepo.create({
      name:     input.name,
      email:    input.email,
      password: hashedPassword,
    });

    // 4. Issue tokens
    const payload: TokenPayload = {
      sub:   created.id,
      email: created.email,
      role:  created.role,
    };

    const accessToken  = this.tokenService.signAccessToken(payload);
    const refreshToken = this.tokenService.signRefreshToken(payload);

    // 5. Return a safe view — password hash is explicitly excluded
    return {
      user: {
        id:    created.id,
        name:  created.name,
        email: created.email,
        role:  created.role,
      },
      accessToken,
      refreshToken,
    };
  }
}
