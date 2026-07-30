import { IDealRepository, DealRecord } from '../../../domain/repositories/IDealRepository';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../shared/errors';

export interface UnpublishDealInput {
  dealId: string;
  requesterId: string;
  requesterRole?: string;
}

export class UnpublishDealUseCase {
  constructor(private readonly dealRepository: IDealRepository) {}

  async execute(input: UnpublishDealInput): Promise<DealRecord> {
    const deal = await this.dealRepository.findById(input.dealId);
    if (!deal) throw new NotFoundError('Deal not found');

    if (deal.dealerId !== input.requesterId && input.requesterRole !== 'ADMIN') {
      throw new ForbiddenError('Access denied');
    }

    if (deal.status !== 'PUBLISHED') {
      throw new BadRequestError('Only published deals can be unpublished');
    }

    return this.dealRepository.update(input.dealId, { status: 'DRAFT' });
  }
}
