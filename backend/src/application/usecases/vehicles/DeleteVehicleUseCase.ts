import type { IVehicleRepository } from '../../../domain/repositories/IVehicleRepository';
import { NotFoundError } from '../../../shared/errors';

export class DeleteVehicleUseCase {
  constructor(private readonly vehicleRepo: IVehicleRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.vehicleRepo.findById(id);
    if (!existing) throw new NotFoundError(`Vehicle ${id} not found`);
    await this.vehicleRepo.softDelete(id);
  }
}
