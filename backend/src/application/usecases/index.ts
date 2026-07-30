/**
 * Use-case barrel export.
 *
 * Each use case is a single class with one public execute() method.
 * Use cases depend only on repository interfaces and application-layer
 * service interfaces — never on Prisma, Express, or any framework.
 */

export { RegisterUserUseCase } from './auth/RegisterUserUseCase';
export { LoginUserUseCase }    from './auth/LoginUserUseCase';

export type { RegisterInput, RegisterOutput, AuthUserView as RegisterAuthUserView } from './auth/RegisterUserUseCase';
export type { LoginInput, LoginOutput, AuthUserView as LoginAuthUserView }          from './auth/LoginUserUseCase';
