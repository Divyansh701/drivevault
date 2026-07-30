import { IDealRepository, DealRecord, UpdateDealData } from '../../../domain/repositories/IDealRepository';
import { IVehicleRepository } from '../../../domain/repositories/IVehicleRepository';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../shared/errors';

export interface UpdateDealInput {
  dealId: string;
  requesterId: string;
  requesterRole?: string;
  title?: string;
  description?: string | null;
  vehicleId?: string | null;
  discountType?: 'PERCENTAGE' | 'FIXED';
  discountValue?: number;
  originalPrice?: number;
  offerPrice?: number;
  startDate?: Date;
  endDate?: Date;
  isFeatured?: boolean;
  bannerImageUrl?: string | null;
}

export class UpdateDealUseCase {
  constructor(
    private readonly dealRepository: IDealRepository,
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(input: UpdateDealInput): Promise<DealRecord> {
    const existing = await this.dealRepository.findById(input.dealId);
    if (!existing) throw new NotFoundError('Deal not found');

    // Ownership check
    if (existing.dealerId !== input.requesterId && input.requesterRole !== 'ADMIN') {
      throw new ForbiddenError('Access denied');
    }

    // Resolve effective dates for validation
    const startDate = input.startDate ?? existing.startDate;
    const endDate   = input.endDate   ?? existing.endDate;
    if (startDate >= endDate) {
      throw new BadRequestError('Start date must be before end date');
    }

    // Resolve effective pricing for validation
    const originalPrice  = input.originalPrice  ?? existing.originalPrice;
    const offerPrice     = input.offerPrice      ?? existing.offerPrice;
    const discountType   = input.discountType    ?? existing.discountType;
    const discountValue  = input.discountValue   ?? existing.discountValue;

    if (offerPrice > originalPrice) {
      throw new BadRequestError('Offer price cannot be higher than original price');
    }
    if (discountType === 'PERCENTAGE' && discountValue > 100) {
      throw new BadRequestError('Percentage discount cannot exceed 100%');
    }

    // Handle vehicle change — denormalise make/model/year
    const updateData: UpdateDealData = {};

    if (input.title      !== undefined) updateData.title         = input.title.trim();
    if (input.description !== undefined) updateData.description  = input.description ?? undefined;
    if (input.discountType !== undefined) updateData.discountType = input.discountType;
    if (input.discountValue !== undefined) updateData.discountValue = input.discountValue;
    if (input.originalPrice !== undefined) updateData.originalPrice = input.originalPrice;
    if (input.offerPrice !== undefined) updateData.offerPrice    = input.offerPrice;
    if (input.startDate  !== undefined) updateData.startDate     = input.startDate;
    if (input.endDate    !== undefined) updateData.endDate       = input.endDate;
    if (input.isFeatured !== undefined) updateData.isFeatured    = input.isFeatured;
    if (input.bannerImageUrl !== undefined) updateData.bannerImageUrl = input.bannerImageUrl ?? undefined;

    if (input.vehicleId !== undefined) {
      if (input.vehicleId === null) {
        // Removing vehicle association
        updateData.vehicleId    = undefined;
        updateData.vehicleMake  = undefined;
        updateData.vehicleModel = undefined;
        updateData.vehicleYear  = undefined;
      } else {
        const vehicle = await this.vehicleRepository.findById(input.vehicleId);
        if (!vehicle) throw new NotFoundError('Vehicle not found');

        updateData.vehicleId    = input.vehicleId;
        updateData.vehicleMake  = vehicle.make;
        updateData.vehicleModel = vehicle.model;
        updateData.vehicleYear  = vehicle.year;
      }
    }

    return this.dealRepository.update(input.dealId, updateData);
  }
}
