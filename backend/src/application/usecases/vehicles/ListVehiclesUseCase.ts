import type { IVehicleRepository, VehicleFilters, VehicleRecord, SortOptions } from '../../../domain/repositories/IVehicleRepository';

export interface ListVehiclesInput {
  filters: VehicleFilters;
  page:    number;
  limit:   number;
  sort?:   SortOptions;
}

export interface ListVehiclesOutput {
  vehicles: VehicleRecord[];
  total:    number;
  page:     number;
  limit:    number;
}

export class ListVehiclesUseCase {
  constructor(private readonly vehicleRepo: IVehicleRepository) {}

  async execute(input: ListVehiclesInput): Promise<ListVehiclesOutput> {
    const [vehicles, total] = await Promise.all([
      this.vehicleRepo.findAll(input.filters, input.page, input.limit, input.sort),
      this.vehicleRepo.count(input.filters),
    ]);

    return { vehicles, total, page: input.page, limit: input.limit };
  }
}
