import { IDealRepository, CreateDealData, DealRecord } from '../../../domain/repositories/IDealRepository';
import { IVehicleRepository } from '../../../domain/repositories/IVehicleRepository';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../../../shared/errors';

export interface CreateDealInput {
  title: string;
  description?: string | null;
  dealerId: string;
  dealerName: string;
  vehicleId?: string | null;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  originalPrice: number;
  offerPrice: number;
  startDate: Date;
  endDate: Date;
  isFeatured?: boolean;
  bannerImageUrl?: string | null;
}

export class CreateDealUseCase {
  constructor(
    private readonly dealRepository: IDealRepository,
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(input: CreateDealInput): Promise<DealRecord> {
    // Validate dates
    if (input.startDate >= input.endDate) {
      throw new BadRequestError('Start date must be before end date');
    }

    // Validate pricing
    if (input.offerPrice > input.originalPrice) {
      throw new BadRequestError('Offer price cannot be higher than original price');
    }

    if (input.discountType === 'PERCENTAGE' && input.discountValue > 100) {
      throw new BadRequestError('Percentage discount cannot exceed 100%');
    }

    // If vehicleId is provided, validate vehicle ownership
    let vehicleMake: string | null = null;
    let vehicleModel: string | null = null;
    let vehicleYear: number | null = null;

    if (input.vehicleId) {
      const vehicle = await this.vehicleRepository.findById(input.vehicleId);
      if (!vehicle) throw new NotFoundError('Vehicle not found');

      // Vehicles use sellerId to track ownership
      if ((vehicle as any).sellerId && (vehicle as any).sellerId !== input.dealerId) {
        throw new ForbiddenError('Vehicle does not belong to this dealer');
      }

      vehicleMake  = vehicle.make;
      vehicleModel = vehicle.model;
      vehicleYear  = vehicle.year;
    }

    const data: CreateDealData = {
      title:          input.title.trim(),
      description:    input.description?.trim() ?? undefined,
      dealerId:       input.dealerId,
      dealerName:     input.dealerName,
      vehicleId:      input.vehicleId ?? undefined,
      vehicleMake:    vehicleMake ?? undefined,
      vehicleModel:   vehicleModel ?? undefined,
      vehicleYear:    vehicleYear ?? undefined,
      discountType:   input.discountType,
      discountValue:  input.discountValue,
      originalPrice:  input.originalPrice,
      offerPrice:     input.offerPrice,
      startDate:      input.startDate,
      endDate:        input.endDate,
      status:         'DRAFT',
      isFeatured:     input.isFeatured ?? false,
      bannerImageUrl: input.bannerImageUrl ?? undefined,
    };

    return this.dealRepository.create(data);
  }
}
