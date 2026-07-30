import { IDealRepository, DealRecord, DealFilters, DealStatus } from '../../../domain/repositories/IDealRepository';
import { ForbiddenError } from '../../../shared/errors';

export interface ListDealsByDealerInput {
  dealerId: string;
  requesterId: string;
  requesterRole?: string;
  status?: DealStatus;
  vehicleId?: string;
  isFeatured?: boolean;
  activeOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface ListDealsByDealerOutput {
  deals: DealRecord[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class ListDealsByDealerUseCase {
  constructor(private readonly dealRepository: IDealRepository) {}

  async execute(input: ListDealsByDealerInput): Promise<ListDealsByDealerOutput> {
    // Ownership check
    if (input.dealerId !== input.requesterId && input.requesterRole !== 'ADMIN') {
      throw new ForbiddenError('Access denied');
    }

    const page  = Math.max(1, input.page ?? 1);
    const limit = Math.min(100, Math.max(1, input.limit ?? 20));

    const filters: DealFilters = {
      dealerId:   input.dealerId,
      status:     input.status,
      vehicleId:  input.vehicleId,
      isFeatured: input.isFeatured,
      activeOnly: input.activeOnly,
    };

    const [deals, totalCount] = await Promise.all([
      this.dealRepository.findAll(filters, page, limit),
      this.dealRepository.count(filters),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      deals,
      totalCount,
      currentPage:     page,
      totalPages,
      hasNextPage:     page < totalPages,
      hasPreviousPage: page > 1,
    };
  }
}
