/**
 * Unit tests — PurchaseVehicleUseCase
 *
 * Business Rules:
 *  1. Decrements vehicle quantity by exactly 1 when quantity > 0.
 *  2. Throws ConflictError when vehicle quantity is 0 (out of stock).
 *  3. Throws NotFoundError when vehicle ID does not exist.
 *  4. Preserves all other vehicle properties unchanged.
 */

import { PurchaseVehicleUseCase } from '../../src/application/usecases/vehicles/PurchaseVehicleUseCase';
import type { IVehicleRepository, VehicleRecord } from '../../src/domain/repositories/IVehicleRepository';
import { NotFoundError, ConflictError } from '../../src/shared/errors';

describe('PurchaseVehicleUseCase', () => {
  let mockRepo: jest.Mocked<IVehicleRepository>;
  let useCase: PurchaseVehicleUseCase;

  const mockVehicle: VehicleRecord = {
    id:          'veh-123',
    make:        'Toyota',
    model:       'Corolla',
    year:        2023,
    category:    'SEDAN',
    powertrain:  'HYBRID',
    price:       '25000.00',
    quantity:    3,
    vin:         '1HGCR2F83HA000000',
    color:       'Red',
    mileage:     100,
    description: 'Reliable sedan',
    status:      'AVAILABLE',
    imageUrls:   [],
    createdAt:   new Date(),
    updatedAt:   new Date(),
    deletedAt:   null,
  };

  beforeEach(() => {
    mockRepo = {
      findAll:    jest.fn(),
      findById:   jest.fn(),
      findByVin:  jest.fn(),
      count:      jest.fn(),
      create:     jest.fn(),
      update:     jest.fn(),
      softDelete: jest.fn(),
    };
    useCase = new PurchaseVehicleUseCase(mockRepo);
  });

  it('successfully decrements quantity by 1 when stock is available', async () => {
    mockRepo.findById.mockResolvedValue(mockVehicle);
    const updatedVehicle = { ...mockVehicle, quantity: 2 };
    mockRepo.update.mockResolvedValue(updatedVehicle);

    const result = await useCase.execute('veh-123');

    expect(mockRepo.findById).toHaveBeenCalledWith('veh-123');
    expect(mockRepo.update).toHaveBeenCalledWith('veh-123', { quantity: 2 });
    expect(result.quantity).toBe(2);
  });

  it('decrements quantity from 1 to 0 when last item is purchased', async () => {
    const singleStockVehicle = { ...mockVehicle, quantity: 1 };
    mockRepo.findById.mockResolvedValue(singleStockVehicle);
    const zeroStockVehicle = { ...mockVehicle, quantity: 0 };
    mockRepo.update.mockResolvedValue(zeroStockVehicle);

    const result = await useCase.execute('veh-123');

    expect(mockRepo.update).toHaveBeenCalledWith('veh-123', { quantity: 0, status: 'SOLD' });
    expect(result.quantity).toBe(0);
  });

  it('throws ConflictError when vehicle quantity is 0', async () => {
    const outOfStockVehicle = { ...mockVehicle, quantity: 0 };
    mockRepo.findById.mockResolvedValue(outOfStockVehicle);

    await expect(useCase.execute('veh-123')).rejects.toThrow(ConflictError);
    await expect(useCase.execute('veh-123')).rejects.toThrow('Vehicle is out of stock');
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('throws ConflictError when vehicle quantity is negative', async () => {
    const negativeStockVehicle = { ...mockVehicle, quantity: -1 };
    mockRepo.findById.mockResolvedValue(negativeStockVehicle);

    await expect(useCase.execute('veh-123')).rejects.toThrow(ConflictError);
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when vehicle does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent')).rejects.toThrow(NotFoundError);
    await expect(useCase.execute('non-existent')).rejects.toThrow('Vehicle non-existent not found');
    expect(mockRepo.update).not.toHaveBeenCalled();
  });
});
