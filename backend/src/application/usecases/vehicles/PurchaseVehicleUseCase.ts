/**
 * PurchaseVehicleUseCase — decrement vehicle quantity by 1 (one unit purchased).
 *
 * Business rules:
 *  - Vehicle must exist (throws NotFoundError if not)
 *  - Vehicle must have quantity > 0 (throws ConflictError if out of stock)
 *  - Decrements quantity by exactly 1 and returns the updated record
 *
 * SRP : One concern — handle a single-unit purchase transaction.
 * DIP : Depends on IVehicleRepository interface only.
 */

import type { IVehicleRepository, VehicleRecord } from '../../../domain/repositories/IVehicleRepository';
import { NotFoundError }  from '../../../shared/errors';
import { ConflictError }  from '../../../shared/errors';

export class PurchaseVehicleUseCase {
  constructor(private readonly vehicleRepo: IVehicleRepository) {}

  async execute(id: string): Promise<VehicleRecord> {
    const existing = await this.vehicleRepo.findById(id);
    if (!existing) throw new NotFoundError(`Vehicle ${id} not found`);

    if (existing.quantity <= 0) {
      throw new ConflictError('Vehicle is out of stock');
    }

    const newQuantity = existing.quantity - 1;
    const updateData: { quantity: number; status?: VehicleRecord['status'] } = {
      quantity: newQuantity,
    };
    if (newQuantity === 0) {
      updateData.status = 'SOLD';
    }

    return this.vehicleRepo.update(id, updateData);
  }
}
