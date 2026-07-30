/**
 * Unit tests — RestockVehicleUseCase
 *
 * Business Rules:
 *  1. Increases vehicle quantity by the specified restock amount.
 *  2. Works when restocking a vehicle with 0 quantity (brings out-of-stock back in stock).
 *  3. Throws NotFoundError when the vehicle ID does not exist.
 *  4. Throws ValidationError if negative or zero quantity is passed directly to the use case.
 */

import { RestockVehicleUseCase } from '../../src/application/usecases/vehicles/RestockVehicleUseCase';
import type { IVehicleRepository, VehicleRecord } from '../../src/domain/repositories/IVehicleRepository';
import { NotFoundError, ValidationError } from '../../src/shared/errors';

describe('RestockVehicleUseCase', () => {
  let mockRepo: jest.Mocked<IVehicleRepository>;
  let useCase: RestockVehicleUseCase;

  const mockVehicle: VehicleRecord = {
    id:          'veh-456',
    make:        'Honda',
    model:       'Civic',
    year:        2024,
    category:    'SEDAN',
    powertrain:  'PETROL',
    price:       '24000.00',
    quantity:    5,
    vin:         '2HGFC2F58MH000000',
    color:       'Blue',
    mileage:     0,
    description: 'Brand new Civic',
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
    useCase = new RestockVehicleUseCase(mockRepo);
  });

  it('increases vehicle quantity by the requested restock amount', async () => {
    mockRepo.findById.mockResolvedValue(mockVehicle);
    const updatedVehicle = { ...mockVehicle, quantity: 15 };
    mockRepo.update.mockResolvedValue(updatedVehicle);

    const result = await useCase.execute({ id: 'veh-456', quantity: 10 });

    expect(mockRepo.findById).toHaveBeenCalledWith('veh-456');
    expect(mockRepo.update).toHaveBeenCalledWith('veh-456', { quantity: 15 });
    expect(result.quantity).toBe(15);
  });

  it('restocks an out-of-stock vehicle (quantity 0 -> positive quantity)', async () => {
    const zeroStockVehicle = { ...mockVehicle, quantity: 0 };
    mockRepo.findById.mockResolvedValue(zeroStockVehicle);
    const restockedVehicle = { ...mockVehicle, quantity: 8 };
    mockRepo.update.mockResolvedValue(restockedVehicle);

    const result = await useCase.execute({ id: 'veh-456', quantity: 8 });

    expect(mockRepo.update).toHaveBeenCalledWith('veh-456', { quantity: 8 });
    expect(result.quantity).toBe(8);
  });

  it('throws NotFoundError when target vehicle does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'non-existent', quantity: 5 })).rejects.toThrow(NotFoundError);
    await expect(useCase.execute({ id: 'non-existent', quantity: 5 })).rejects.toThrow('Vehicle non-existent not found');
    expect(mockRepo.update).not.toHaveBeenCalled();
  });
});
