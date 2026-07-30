import { IDealRepository, DealRecord } from '../../../domain/repositories/IDealRepository';
import { ForbiddenError, NotFoundError } from '../../../shared/errors';

export interface GetDealByIdInput {
  dealId: string;
  requesterId?: string;
  requesterRole?: string;
}

export class GetDealByIdUseCase {
  constructor(private readonly dealRepository: IDealRepository) {}

  async execute(input: GetDealByIdInput): Promise<DealRecord> {
    const deal = await this.dealRepository.findById(input.dealId);
    if (!deal) throw new NotFoundError('Deal not found');

    // Published deals within date range are publicly accessible
    const now = new Date();
    const isPubliclyActive =
      deal.status === 'PUBLISHED' &&
      now >= deal.startDate &&
      now <= deal.endDate;

    if (isPubliclyActive) return deal;

    // Non-public deals require authentication and ownership / admin
    if (!input.requesterId) throw new ForbiddenError('Access denied');
    if (deal.dealerId === input.requesterId) return deal;
    if (input.requesterRole === 'ADMIN') return deal;

    throw new ForbiddenError('Access denied');
  }
}
