/**
 * VehicleController — HTTP handler for vehicle CRUD operations.
 *
 * SRP  : One job — parse HTTP requests, delegate to use cases, format responses.
 * DIP  : Depends on use case interfaces/classes only; zero Prisma/Express coupling.
 * OCP  : New vehicle actions add a new use case + method; this file need not change
 *         unless the action is a direct CRUD analog.
 *
 * All validation is performed by Zod schemas before the handler runs.
 * All business errors thrown by use cases are caught and forwarded to next().
 */

import { Request, Response, NextFunction } from 'express';
import { createVehicleSchema, updateVehicleSchema, restockSchema, searchQuerySchema } from '../../application/validators/vehicle.validator';
import { flattenZodErrors } from '../../shared/utils/validation';
import type { CreateVehicleUseCase }    from '../../application/usecases/vehicles/CreateVehicleUseCase';
import type { GetVehicleByIdUseCase }   from '../../application/usecases/vehicles/GetVehicleByIdUseCase';
import type { ListVehiclesUseCase }     from '../../application/usecases/vehicles/ListVehiclesUseCase';
import type { UpdateVehicleUseCase }    from '../../application/usecases/vehicles/UpdateVehicleUseCase';
import type { DeleteVehicleUseCase }    from '../../application/usecases/vehicles/DeleteVehicleUseCase';
import type { PurchaseVehicleUseCase }  from '../../application/usecases/vehicles/PurchaseVehicleUseCase';
import type { RestockVehicleUseCase }   from '../../application/usecases/vehicles/RestockVehicleUseCase';
import type { VehicleFilters, VehicleRecord, SortOptions, SortField, SortOrder } from '../../domain/repositories/IVehicleRepository';
import { ZodError }                            from 'zod';

export class VehicleController {
  constructor(
    private readonly createUseCase:     CreateVehicleUseCase,
    private readonly getByIdUseCase:    GetVehicleByIdUseCase,
    private readonly listUseCase:       ListVehiclesUseCase,
    private readonly updateUseCase:     UpdateVehicleUseCase,
    private readonly deleteUseCase:     DeleteVehicleUseCase,
    private readonly purchaseUseCase:   PurchaseVehicleUseCase,
    private readonly restockUseCase:    RestockVehicleUseCase,
  ) {}

  // ── POST /vehicles ──────────────────────────────────────────────────────────

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = createVehicleSchema.safeParse(req.body);
      if (!parsed.success) {
        const errors = this.flattenZodErrors(parsed.error);
        res.status(422).json({ status: 'fail', statusCode: 422, errors });
        return;
      }

      const vehicle = await this.createUseCase.execute(parsed.data);

      res.status(201).json({
        status: 'success',
        data: { vehicle: this.serializeVehicle(vehicle) },
      });
    } catch (err) {
      next(err);
    }
  };

  // ── GET /vehicles ───────────────────────────────────────────────────────────

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = searchQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        const errors = this.flattenZodErrors(parsed.error);
        res.status(422).json({ status: 'fail', statusCode: 422, errors });
        return;
      }

      const { page, limit, sortBy, sortOrder, ...queryFilters } = parsed.data;

      const filters: VehicleFilters = {
        make:       queryFilters.make,
        model:      queryFilters.model,
        category:   queryFilters.category,
        powertrain: queryFilters.powertrain,
        status:     queryFilters.status,
        minPrice:   queryFilters.minPrice,
        maxPrice:   queryFilters.maxPrice,
        minYear:    queryFilters.minYear,
        maxYear:    queryFilters.maxYear,
        year:       queryFilters.year,
      };

      const sort: SortOptions | undefined = sortBy
        ? { field: sortBy as SortField, order: (sortOrder ?? 'asc') as SortOrder }
        : undefined;

      const result = await this.listUseCase.execute({ filters, page, limit, sort });
      const totalPages = Math.ceil(result.total / result.limit);

      res.status(200).json({
        status: 'success',
        data: {
          vehicles:   result.vehicles.map((v) => this.serializeVehicle(v)),
          pagination: {
            page:       result.page,
            limit:      result.limit,
            total:      result.total,
            totalPages: Number.isNaN(totalPages) ? 0 : totalPages,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  };

  // ── GET /vehicles/:id ───────────────────────────────────────────────────────

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vehicle = await this.getByIdUseCase.execute(req.params['id'] as string);
      res.status(200).json({
        status: 'success',
        data: { vehicle: this.serializeVehicle(vehicle) },
      });
    } catch (err) {
      next(err);
    }
  };

  // ── PATCH /vehicles/:id ─────────────────────────────────────────────────────

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = updateVehicleSchema.safeParse(req.body);
      if (!parsed.success) {
        const errors = this.flattenZodErrors(parsed.error);
        res.status(422).json({ status: 'fail', statusCode: 422, errors });
        return;
      }

      const vehicle = await this.updateUseCase.execute(req.params['id'] as string, parsed.data);

      res.status(200).json({
        status: 'success',
        data: { vehicle: this.serializeVehicle(vehicle) },
      });
    } catch (err) {
      next(err);
    }
  };

  // ── DELETE /vehicles/:id ───────────────────────────────────────

  softDelete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteUseCase.execute(req.params['id'] as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  // ── PUT /vehicles/:id ─────────────────────────────────────────────────
  // Full replace — validates the entire body with createVehicleSchema
  // (all required fields must be present, unlike PATCH).

  put = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = createVehicleSchema.safeParse(req.body);
      if (!parsed.success) {
        const errors = this.flattenZodErrors(parsed.error);
        res.status(422).json({ status: 'fail', statusCode: 422, errors });
        return;
      }

      const vehicle = await this.updateUseCase.execute(req.params['id'] as string, parsed.data);

      res.status(200).json({
        status: 'success',
        data: { vehicle: this.serializeVehicle(vehicle) },
      });
    } catch (err) {
      next(err);
    }
  };

  // ── GET /vehicles/search ───────────────────────────────────────────────
  // Dedicated search endpoint — same query params as GET /vehicles.
  // Mounted BEFORE /:id so Express does not misinterpret 'search' as an id.

  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Delegate entirely to the list handler — same logic, same response shape.
    return this.list(req, res, next);
  };

  // ── POST /vehicles/:id/purchase ────────────────────────────────────────

  purchase = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vehicle = await this.purchaseUseCase.execute(req.params['id'] as string);
      res.status(200).json({
        status: 'success',
        data: { vehicle: this.serializeVehicle(vehicle) },
      });
    } catch (err) {
      next(err);
    }
  };

  // ── POST /vehicles/:id/restock ─────────────────────────────────────────

  restock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = restockSchema.safeParse(req.body);
      if (!parsed.success) {
        const errors = this.flattenZodErrors(parsed.error);
        res.status(422).json({ status: 'fail', statusCode: 422, errors });
        return;
      }

      const vehicle = await this.restockUseCase.execute({
        id:       req.params['id'] as string,
        quantity: parsed.data.quantity,
      });

      res.status(200).json({
        status: 'success',
        data: { vehicle: this.serializeVehicle(vehicle) },
      });
    } catch (err) {
      next(err);
    }
  };

  // ── Private helpers ─────────────────────────────────────────────────────────

  /** Serialize a VehicleRecord to a safe JSON-friendly shape. */
  private serializeVehicle(vehicle: VehicleRecord) {
    return {
      id:          vehicle.id,
      make:        vehicle.make,
      model:       vehicle.model,
      year:        vehicle.year,
      category:    vehicle.category,
      powertrain:  vehicle.powertrain,
      price:       vehicle.price,
      quantity:    vehicle.quantity,
      vin:         vehicle.vin,
      color:       vehicle.color,
      mileage:     vehicle.mileage,
      description: vehicle.description,
      status:      vehicle.status,
      imageUrls:   vehicle.imageUrls,
      createdAt:   vehicle.createdAt,
      updatedAt:   vehicle.updatedAt,
    };
  }

  /** Convert ZodError into { fieldName: firstMessage } map for the API response. */
  private flattenZodErrors(err: ZodError): Record<string, string> {
    return flattenZodErrors(err);
  }
}

