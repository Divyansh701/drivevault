import type { IVehicleRepository, VehicleRecord } from '../../../domain/repositories/IVehicleRepository';
import { NotFoundError } from '../../../shared/errors';

export class GetVehicleByIdUseCase {
  constructor(private readonly vehicleRepo: IVehicleRepository) {}

  async execute(id: string): Promise<VehicleRecord> {
    const vehicle = await this.vehicleRepo.findById(id);
    if (!vehicle) throw new NotFoundError(`Vehicle ${id} not found`);
    return vehicle;
  }
}
