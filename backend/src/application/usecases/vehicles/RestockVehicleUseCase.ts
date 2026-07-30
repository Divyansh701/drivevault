/**
 * RestockVehicleUseCase — increase vehicle quantity by a given amount.
 *
 * Business rules:
 *  - Vehicle must exist (throws NotFoundError if not)
 *  - Restock quantity must be a positive integer (validated by Zod at the controller layer)
 *  - Returns the updated record with new quantity
 *
 * SRP : One concern — handle inventory restocking.
 * DIP : Depends on IVehicleRepository interface only.
 */

import type { IVehicleRepository, VehicleRecord } from '../../../domain/repositories/IVehicleRepository';
import { NotFoundError } from '../../../shared/errors';

export interface RestockInput {
  id:       string;
  quantity: number;   // positive integer — validated upstream
}

export class RestockVehicleUseCase {
  constructor(private readonly vehicleRepo: IVehicleRepository) {}

  async execute(input: RestockInput): Promise<VehicleRecord> {
    const existing = await this.vehicleRepo.findById(input.id);
    if (!existing) throw new NotFoundError(`Vehicle ${input.id} not found`);

    const newQuantity = existing.quantity + input.quantity;
    const updateData: { quantity: number; status?: VehicleRecord['status'] } = {
      quantity: newQuantity,
    };

    if (existing.status === 'SOLD' && newQuantity > 0) {
      updateData.status = 'AVAILABLE';
    }

    return this.vehicleRepo.update(input.id, updateData);
  }
}
