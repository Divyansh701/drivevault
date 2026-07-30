/**
 * DealController — HTTP handler for deal CRUD and lifecycle operations.
 *
 * SRP: Parse HTTP requests → delegate to use cases → format responses.
 * All validation is done by Zod schemas before reaching handlers.
 * Business errors thrown by use cases propagate to next() and are handled
 * by the global error-handler middleware.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError }                         from 'zod';

import {
  CreateDealSchema,
  UpdateDealSchema,
  DealIdParamSchema,
  ListDealsByDealerSchema,
  ListPublicDealsSchema,
} from '../validators/dealValidator';
import { flattenZodErrors } from '../../shared/utils/validation';

import type { CreateDealUseCase }        from '../../application/usecases/deal/CreateDealUseCase';
import type { GetDealByIdUseCase }       from '../../application/usecases/deal/GetDealByIdUseCase';
import type { ListDealsByDealerUseCase } from '../../application/usecases/deal/ListDealsByDealerUseCase';
import type { ListPublicDealsUseCase }   from '../../application/usecases/deal/ListPublicDealsUseCase';
import type { UpdateDealUseCase }        from '../../application/usecases/deal/UpdateDealUseCase';
import type { DeleteDealUseCase }        from '../../application/usecases/deal/DeleteDealUseCase';
import type { PublishDealUseCase }       from '../../application/usecases/deal/PublishDealUseCase';
import type { UnpublishDealUseCase }     from '../../application/usecases/deal/UnpublishDealUseCase';

import type { DealRecord } from '../../domain/repositories/IDealRepository';

interface AuthenticatedRequest extends Request {
  user?: { id: string; name: string; email: string; role: 'ADMIN' | 'STAFF' | 'DEALER' | 'VIEWER' | 'CUSTOMER' };
}

export class DealController {
  constructor(
    private readonly createUseCase:        CreateDealUseCase,
    private readonly getByIdUseCase:       GetDealByIdUseCase,
    private readonly listByDealerUseCase:  ListDealsByDealerUseCase,
    private readonly listPublicUseCase:    ListPublicDealsUseCase,
    private readonly updateUseCase:        UpdateDealUseCase,
    private readonly deleteUseCase:        DeleteDealUseCase,
    private readonly publishUseCase:       PublishDealUseCase,
    private readonly unpublishUseCase:     UnpublishDealUseCase,
  ) {}

  // ── PUBLIC ─────────────────────────────────────────────────────────────────

  /** GET /api/v1/public/deals */
  listPublic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = ListPublicDealsSchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(422).json({ status: 'fail', errors: this.flattenZodErrors(parsed.error) });
        return;
      }
      const result = await this.listPublicUseCase.execute(parsed.data);
      res.status(200).json({ status: 'success', data: { deals: result.deals.map(this.serialize), totalCount: result.totalCount } });
    } catch (err) { next(err); }
  };

  /** GET /api/v1/public/deals/:id */
  getPublic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = DealIdParamSchema.safeParse(req.params);
      if (!parsed.success) {
        res.status(422).json({ status: 'fail', errors: this.flattenZodErrors(parsed.error) });
        return;
      }
      const deal = await this.getByIdUseCase.execute({ dealId: parsed.data.id });
      res.status(200).json({ status: 'success', data: { deal: this.serialize(deal) } });
    } catch (err) { next(err); }
  };

  // ── PROTECTED ──────────────────────────────────────────────────────────────

  /** POST /api/v1/deals */
  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ status: 'fail', message: 'Authentication required' }); return; }

      const parsed = CreateDealSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(422).json({ status: 'fail', errors: this.flattenZodErrors(parsed.error) });
        return;
      }

      const deal = await this.createUseCase.execute({
        ...parsed.data,
        dealerId:   req.user.id,
        dealerName: req.user.name,
      });
      res.status(201).json({ status: 'success', data: { deal: this.serialize(deal) } });
    } catch (err) { next(err); }
  };

  /** GET /api/v1/deals */
  listByDealer = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ status: 'fail', message: 'Authentication required' }); return; }

      const parsed = ListDealsByDealerSchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(422).json({ status: 'fail', errors: this.flattenZodErrors(parsed.error) });
        return;
      }

      const result = await this.listByDealerUseCase.execute({
        ...parsed.data,
        dealerId:      req.user.id,
        requesterId:   req.user.id,
        requesterRole: req.user.role,
      });

      res.status(200).json({
        status: 'success',
        data: {
          deals:     result.deals.map(this.serialize),
          totalCount: result.totalCount,
          pagination: {
            currentPage:     result.currentPage,
            totalPages:      result.totalPages,
            hasNextPage:     result.hasNextPage,
            hasPreviousPage: result.hasPreviousPage,
          },
        },
      });
    } catch (err) { next(err); }
  };

  /** GET /api/v1/deals/:id */
  getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = DealIdParamSchema.safeParse(req.params);
      if (!parsed.success) {
        res.status(422).json({ status: 'fail', errors: this.flattenZodErrors(parsed.error) });
        return;
      }
      const deal = await this.getByIdUseCase.execute({
        dealId:        parsed.data.id,
        requesterId:   req.user?.id,
        requesterRole: req.user?.role,
      });
      res.status(200).json({ status: 'success', data: { deal: this.serialize(deal) } });
    } catch (err) { next(err); }
  };

  /** PATCH /api/v1/deals/:id */
  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ status: 'fail', message: 'Authentication required' }); return; }

      const parsedParams = DealIdParamSchema.safeParse(req.params);
      if (!parsedParams.success) {
        res.status(422).json({ status: 'fail', errors: this.flattenZodErrors(parsedParams.error) });
        return;
      }
      const parsedBody = UpdateDealSchema.safeParse(req.body);
      if (!parsedBody.success) {
        res.status(422).json({ status: 'fail', errors: this.flattenZodErrors(parsedBody.error) });
        return;
      }

      const deal = await this.updateUseCase.execute({
        dealId:        parsedParams.data.id,
        requesterId:   req.user.id,
        requesterRole: req.user.role,
        ...parsedBody.data,
      });
      res.status(200).json({ status: 'success', data: { deal: this.serialize(deal) } });
    } catch (err) { next(err); }
  };

  /** DELETE /api/v1/deals/:id */
  delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ status: 'fail', message: 'Authentication required' }); return; }

      const parsed = DealIdParamSchema.safeParse(req.params);
      if (!parsed.success) {
        res.status(422).json({ status: 'fail', errors: this.flattenZodErrors(parsed.error) });
        return;
      }
      await this.deleteUseCase.execute({ dealId: parsed.data.id, requesterId: req.user.id, requesterRole: req.user.role });
      res.status(204).send();
    } catch (err) { next(err); }
  };

  /** POST /api/v1/deals/:id/publish */
  publish = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ status: 'fail', message: 'Authentication required' }); return; }

      const parsed = DealIdParamSchema.safeParse(req.params);
      if (!parsed.success) {
        res.status(422).json({ status: 'fail', errors: this.flattenZodErrors(parsed.error) });
        return;
      }
      const deal = await this.publishUseCase.execute({ dealId: parsed.data.id, requesterId: req.user.id, requesterRole: req.user.role });
      res.status(200).json({ status: 'success', data: { deal: this.serialize(deal) } });
    } catch (err) { next(err); }
  };

  /** POST /api/v1/deals/:id/unpublish */
  unpublish = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ status: 'fail', message: 'Authentication required' }); return; }

      const parsed = DealIdParamSchema.safeParse(req.params);
      if (!parsed.success) {
        res.status(422).json({ status: 'fail', errors: this.flattenZodErrors(parsed.error) });
        return;
      }
      const deal = await this.unpublishUseCase.execute({ dealId: parsed.data.id, requesterId: req.user.id, requesterRole: req.user.role });
      res.status(200).json({ status: 'success', data: { deal: this.serialize(deal) } });
    } catch (err) { next(err); }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private serialize = (deal: DealRecord) => ({
    id:             deal.id,
    title:          deal.title,
    description:    deal.description,
    dealerId:       deal.dealerId,
    dealerName:     deal.dealerName,
    vehicleId:      deal.vehicleId,
    vehicleMake:    deal.vehicleMake,
    vehicleModel:   deal.vehicleModel,
    vehicleYear:    deal.vehicleYear,
    discountType:   deal.discountType,
    discountValue:  deal.discountValue,
    originalPrice:  deal.originalPrice,
    offerPrice:     deal.offerPrice,
    startDate:      deal.startDate,
    endDate:        deal.endDate,
    status:         deal.status,
    isFeatured:     deal.isFeatured,
    bannerImageUrl: deal.bannerImageUrl,
    createdAt:      deal.createdAt,
    updatedAt:      deal.updatedAt,
  });

  private flattenZodErrors(err: ZodError): Record<string, string> {
    return flattenZodErrors(err);
  }
}
