import { IDealRepository, DealRecord } from '../../../domain/repositories/IDealRepository';

export interface ListPublicDealsInput {
  vehicleId?: string;
  limit?: number;
  featured?: boolean;
}

export interface ListPublicDealsOutput {
  deals: DealRecord[];
  totalCount: number;
}

export class ListPublicDealsUseCase {
  constructor(private readonly dealRepository: IDealRepository) {}

  async execute(input: ListPublicDealsInput): Promise<ListPublicDealsOutput> {
    const limit = Math.min(100, Math.max(1, input.limit ?? 50));

    let deals: DealRecord[];

    if (input.vehicleId) {
      deals = await this.dealRepository.findActiveByVehicle(input.vehicleId);
      if (input.featured) deals = deals.filter(d => d.isFeatured);
      deals = deals.slice(0, limit);
    } else {
      deals = await this.dealRepository.findPublicActive(limit);
      if (input.featured) deals = deals.filter(d => d.isFeatured);
    }

    return { deals, totalCount: deals.length };
  }
}
