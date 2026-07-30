/**
 * Express application factory — composition root.
 *
 * This is the ONLY file that:
 *  - Instantiates concrete infrastructure classes (repositories, services)
 *  - Wires them into use cases via constructor injection (DIP)
 *  - Wires use cases into controllers
 *  - Passes controllers into route factories
 *
 * IMPORTANT — Router factory pattern
 * ────────────────────────────────────
 * createRootRouter() is called inside createApp() so each invocation
 * (including each Supertest test file) gets a completely fresh Router.
 * This prevents duplicate route registrations from accumulating when
 * createApp() is called multiple times across the test suite.
 */

import express, { Application } from 'express';
import helmet                   from 'helmet';
import cors                     from 'cors';
import rateLimit                from 'express-rate-limit';

// ── Shared ──────────────────────────────────────────────────────────────────
import { config } from './shared/utils/config';

// ── Presentation ────────────────────────────────────────────────────────────
import { requestLogger, notFound, errorHandler } from './presentation/middleware';
import { createRootRouter }      from './presentation/routes';
import { AuthController }        from './presentation/controllers/AuthController';
import { VehicleController }     from './presentation/controllers/VehicleController';
import { DealController }        from './presentation/controllers/DealController';

// ── Application use cases ───────────────────────────────────────────────────
import { RegisterUserUseCase }    from './application/usecases/auth/RegisterUserUseCase';
import { LoginUserUseCase }       from './application/usecases/auth/LoginUserUseCase';
import { CreateVehicleUseCase }   from './application/usecases/vehicles/CreateVehicleUseCase';
import { GetVehicleByIdUseCase }  from './application/usecases/vehicles/GetVehicleByIdUseCase';
import { ListVehiclesUseCase }    from './application/usecases/vehicles/ListVehiclesUseCase';
import { UpdateVehicleUseCase }   from './application/usecases/vehicles/UpdateVehicleUseCase';
import { DeleteVehicleUseCase }   from './application/usecases/vehicles/DeleteVehicleUseCase';
import { PurchaseVehicleUseCase } from './application/usecases/vehicles/PurchaseVehicleUseCase';
import { RestockVehicleUseCase }  from './application/usecases/vehicles/RestockVehicleUseCase';
import {
  CreateDealUseCase,
  GetDealByIdUseCase,
  ListDealsByDealerUseCase,
  ListPublicDealsUseCase,
  UpdateDealUseCase,
  DeleteDealUseCase,
  PublishDealUseCase,
  UnpublishDealUseCase,
}                                 from './application/usecases/deal';

// ── Infrastructure — concrete implementations ───────────────────────────────
import { BcryptPasswordHasher }       from './infrastructure/services/BcryptPasswordHasher';
import { JwtTokenService }            from './infrastructure/services/JwtTokenService';
import { MongoDBUserRepository }      from './infrastructure/repositories/MongoDBUserRepository';
import { MongoDBVehicleRepository }   from './infrastructure/repositories/MongoDBVehicleRepository';
import { MongoDBDealRepository }      from './infrastructure/repositories/MongoDBDealRepository';

export function createApp(): Application {
  const app = express();

  // ─────────────────────────────────────────────────────────────────────────
  // 1. Instantiate infrastructure  (innermost layer — no app-layer imports)
  // ─────────────────────────────────────────────────────────────────────────
  //
  // Repository:
  //   MongoDBUserRepository     → production  (MongoDB with Mongoose)
  //   MongoDBVehicleRepository  → production  (MongoDB with Mongoose)
  //
  // NOTE: MongoDB connection must be established before using these repositories.
  // Call mongoDBClient.connect() in server.ts before starting the Express server.
  //
  const userRepository    = new MongoDBUserRepository();
  const vehicleRepository = new MongoDBVehicleRepository();
  const dealRepository    = new MongoDBDealRepository();

  const passwordHasher = new BcryptPasswordHasher(config.bcrypt.rounds);

  const tokenService = new JwtTokenService(
    config.jwt.secret,
    config.jwt.expiresIn,
    config.jwt.refreshSecret,
    config.jwt.refreshExpiresIn,
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Instantiate use cases  (depend on interfaces — not concrete classes)
  // ─────────────────────────────────────────────────────────────────────────
  const registerUseCase = new RegisterUserUseCase(
    userRepository,
    passwordHasher,
    tokenService,
  );

  const loginUseCase = new LoginUserUseCase(
    userRepository,
    passwordHasher,
    tokenService,
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Instantiate controllers  (depend on use cases — not repositories)
  // ─────────────────────────────────────────────────────────────────────────
  const authController = new AuthController(registerUseCase, loginUseCase);

  // ─────────────────────────────────────────────────────────────────────────
  // 3b. Instantiate vehicle use cases and controller
  // ─────────────────────────────────────────────────────────────────────────
  const createVehicleUseCase   = new CreateVehicleUseCase(vehicleRepository);
  const getVehicleByIdUseCase  = new GetVehicleByIdUseCase(vehicleRepository);
  const listVehiclesUseCase    = new ListVehiclesUseCase(vehicleRepository);
  const updateVehicleUseCase   = new UpdateVehicleUseCase(vehicleRepository);
  const deleteVehicleUseCase   = new DeleteVehicleUseCase(vehicleRepository);
  const purchaseVehicleUseCase = new PurchaseVehicleUseCase(vehicleRepository);
  const restockVehicleUseCase  = new RestockVehicleUseCase(vehicleRepository);

  const vehicleController = new VehicleController(
    createVehicleUseCase,
    getVehicleByIdUseCase,
    listVehiclesUseCase,
    updateVehicleUseCase,
    deleteVehicleUseCase,
    purchaseVehicleUseCase,
    restockVehicleUseCase,
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 3c. Instantiate deal use cases and controller
  // ─────────────────────────────────────────────────────────────────────────
  const createDealUseCase       = new CreateDealUseCase(dealRepository, vehicleRepository);
  const getDealByIdUseCase      = new GetDealByIdUseCase(dealRepository);
  const listDealsByDealerUseCase = new ListDealsByDealerUseCase(dealRepository);
  const listPublicDealsUseCase  = new ListPublicDealsUseCase(dealRepository);
  const updateDealUseCase       = new UpdateDealUseCase(dealRepository, vehicleRepository);
  const deleteDealUseCase       = new DeleteDealUseCase(dealRepository);
  const publishDealUseCase      = new PublishDealUseCase(dealRepository);
  const unpublishDealUseCase    = new UnpublishDealUseCase(dealRepository);

  const dealController = new DealController(
    createDealUseCase,
    getDealByIdUseCase,
    listDealsByDealerUseCase,
    listPublicDealsUseCase,
    updateDealUseCase,
    deleteDealUseCase,
    publishDealUseCase,
    unpublishDealUseCase,
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Build a fresh router tree for this app instance
  //    (factory pattern — prevents duplicate routes across test calls)
  // ─────────────────────────────────────────────────────────────────────────
  const rootRouter = createRootRouter({
    authController,
    vehicleController,
    dealController,
    tokenService,
    userRepository,
    passwordHasher,
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Express middleware stack  (order is significant)
  // ─────────────────────────────────────────────────────────────────────────

  // Security headers — must be first
  app.use(helmet());

  // CORS — dynamic origin callback for separate production domain hosting
  app.use(
    cors({
      origin: (requestOrigin, callback) => {
        // Allow server-to-server, mobile, CLI, or health checks with no origin header
        if (!requestOrigin) {
          return callback(null, true);
        }

        const allowedOrigins = config.cors.origins;

        // Wildcard '*' or exact domain match
        if (allowedOrigins.includes('*') || allowedOrigins.includes(requestOrigin)) {
          return callback(null, true);
        }

        // In development mode, auto-allow any http://localhost or http://127.0.0.1 port
        if (config.isDevelopment && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(requestOrigin)) {
          return callback(null, true);
        }

        return callback(new Error(`CORS blocked: Origin ${requestOrigin} is not permitted.`));
      },
      methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
      credentials:    true,
      optionsSuccessStatus: 200,
    }),
  );

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // HTTP request logging (silenced automatically in test environment)
  app.use(requestLogger);

  // Rate limiting — applied globally before routes
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max:      config.rateLimit.maxRequests,
    standardHeaders: true,  // Return RateLimit-* headers
    legacyHeaders:   false, // Disable X-RateLimit-* headers
    message: { status: 'error', statusCode: 429, message: 'Too many requests, please try again later.' },
  });
  app.use(limiter);

  // All API routes under /api/v1
  app.use(config.apiPrefix, rootRouter);

  // /api alias — forward to the same handler without re-registering routes
  if (config.apiPrefix !== '/api') {
    app.use('/api', (_req, res) => {
      res.redirect(301, _req.originalUrl.replace('/api', config.apiPrefix));
    });
  }

  // 404 catch-all — must come after all routes
  app.use(notFound);

  // Global error handler — must be last (4-parameter signature required)
  app.use(errorHandler);

  return app;
}
