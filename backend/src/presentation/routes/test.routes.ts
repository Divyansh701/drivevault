import { Router, Request, Response, NextFunction } from 'express';
import type { IUserRepository } from '../../domain/repositories/IUserRepository';
import type { IPasswordHasher } from '../../application/interfaces/IPasswordHasher';
import type { ITokenService } from '../../application/interfaces/ITokenService';

export interface TestRouterDeps {
  userRepository: IUserRepository;
  passwordHasher: IPasswordHasher;
  tokenService:   ITokenService;
}

export function createTestRouter(deps: TestRouterDeps): Router {
  const router = Router();

  router.post('/seed-user', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password, role } = req.body;
      const hashedPassword = await deps.passwordHasher.hash(password || 'TestPass1!');
      const user = await deps.userRepository.create({
        name:     name || 'Test User',
        email:    email || `test.${Date.now()}@test.com`,
        password: hashedPassword,
        role:     role || 'VIEWER',
      });

      const tokenPayload = { sub: user.id, email: user.email, role: user.role };
      const accessToken  = deps.tokenService.signAccessToken(tokenPayload);
      const refreshToken = deps.tokenService.signRefreshToken(tokenPayload);

      res.status(201).json({
        status: 'success',
        data: {
          user: {
            id:    user.id,
            name:  user.name,
            email: user.email,
            role:  user.role,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
