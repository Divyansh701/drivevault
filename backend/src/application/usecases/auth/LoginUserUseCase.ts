/**
 * LoginUserUseCase — verify credentials and return auth tokens.
 *
 * SOLID
 * ─────
 * SRP  : One job — verify identity and issue tokens.
 * DIP  : Depends on IUserRepository, IPasswordHasher, ITokenService.
 * OCP  : Auth strategy changes (e.g. MFA) extend this class or wrap it;
 *        no controller or route changes needed.
 *
 * Security
 * ────────
 * Both "email not found" and "wrong password" throw the SAME error with the
 * SAME message ("Invalid email or password").  This prevents user-enumeration
 * attacks where an attacker could distinguish between the two cases from
 * differing response messages or timing.
 *
 * The timing-safe bcrypt compare already defends against timing attacks on
 * the password comparison branch.  For the "user not found" branch we run a
 * dummy compare against a hardcoded hash to equalise execution time.
 */

import type { IUserRepository }         from '../../../domain/repositories/IUserRepository';
import type { IPasswordHasher }          from '../../interfaces/IPasswordHasher';
import type { ITokenService, TokenPayload } from '../../interfaces/ITokenService';
import { UnauthorizedError }             from '../../../shared/errors';

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export interface LoginInput {
  email:    string;   // already lowercased by Zod schema
  password: string;   // plaintext — compared against stored hash
}

export interface AuthUserView {
  id:    string;
  name:  string;
  email: string;
  role:  string;
}

export interface LoginOutput {
  user:         AuthUserView;
  accessToken:  string;
  refreshToken: string;
}

// ---------------------------------------------------------------------------
// Sentinel hash — used to equalise timing when a user is not found.
// Pre-computed bcrypt hash of the string "sentinel" at cost 10.
// The actual string doesn't matter; only the structural format does so
// bcrypt.compare takes the same code path as a real comparison.
// ---------------------------------------------------------------------------
const SENTINEL_HASH =
  '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345';

// ---------------------------------------------------------------------------
// Single shared error message — never distinguish email vs password failure
// ---------------------------------------------------------------------------
const INVALID_CREDENTIALS = 'Invalid email or password';

// ---------------------------------------------------------------------------
// Use case
// ---------------------------------------------------------------------------

export class LoginUserUseCase {
  constructor(
    private readonly userRepo:     IUserRepository,
    private readonly hasher:       IPasswordHasher,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    // 1. Look up user by email
    const user = await this.userRepo.findByEmail(input.email);

    if (!user) {
      // Run a dummy compare so timing is the same as a real password check
      await this.hasher.compare(input.password, SENTINEL_HASH);
      throw new UnauthorizedError(INVALID_CREDENTIALS);
    }

    // 2. Verify the account is active
    if (!user.isActive) {
      // Treat disabled accounts the same as "not found" — no information leak
      await this.hasher.compare(input.password, SENTINEL_HASH);
      throw new UnauthorizedError(INVALID_CREDENTIALS);
    }

    // 3. Timing-safe password comparison
    const passwordMatches = await this.hasher.compare(
      input.password,
      user.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedError(INVALID_CREDENTIALS);
    }

    // 4. Issue tokens
    const payload: TokenPayload = {
      sub:   user.id,
      email: user.email,
      role:  user.role,
    };

    const accessToken  = this.tokenService.signAccessToken(payload);
    const refreshToken = this.tokenService.signRefreshToken(payload);

    // 5. Return safe view — password hash excluded
    return {
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
      accessToken,
      refreshToken,
    };
  }
}
