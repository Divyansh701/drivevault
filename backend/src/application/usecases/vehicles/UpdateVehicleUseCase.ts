import type { IVehicleRepository, VehicleRecord, UpdateVehicleData } from '../../../domain/repositories/IVehicleRepository';
import { NotFoundError } from '../../../shared/errors';

export class UpdateVehicleUseCase {
  constructor(private readonly vehicleRepo: IVehicleRepository) {}

  async execute(id: string, data: UpdateVehicleData): Promise<VehicleRecord> {
    const existing = await this.vehicleRepo.findById(id);
    if (!existing) throw new NotFoundError(`Vehicle ${id} not found`);
    return this.vehicleRepo.update(id, data);
  }
}
