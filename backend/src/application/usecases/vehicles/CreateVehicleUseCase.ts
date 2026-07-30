import type { IVehicleRepository, VehicleRecord, CreateVehicleData } from '../../../domain/repositories/IVehicleRepository';
import { BadRequestError, ConflictError } from '../../../shared/errors';

export class CreateVehicleUseCase {
  constructor(private readonly vehicleRepo: IVehicleRepository) {}

  async execute(data: CreateVehicleData): Promise<VehicleRecord> {
    // Validate price is a positive number
    const price = parseFloat(data.price);
    if (isNaN(price) || price <= 0) {
      throw new BadRequestError('Price must be a positive number');
    }

    // Validate quantity
    if (data.quantity < 0) {
      throw new BadRequestError('Quantity cannot be negative');
    }

    // Validate year is reasonable
    const currentYear = new Date().getFullYear();
    if (data.year < 1886 || data.year > currentYear + 2) {
      throw new BadRequestError(`Year must be between 1886 and ${currentYear + 2}`);
    }

    // Enforce VIN uniqueness if provided
    if (data.vin) {
      const existing = await this.vehicleRepo.findByVin(data.vin.toUpperCase());
      if (existing) {
        throw new ConflictError(`A vehicle with VIN ${data.vin.toUpperCase()} already exists`);
      }
    }

    return this.vehicleRepo.create(data);
  }
}
