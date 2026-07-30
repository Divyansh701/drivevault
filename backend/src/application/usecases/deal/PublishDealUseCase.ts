import { IDealRepository, DealRecord } from '../../../domain/repositories/IDealRepository';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../shared/errors';

export interface PublishDealInput {
  dealId: string;
  requesterId: string;
  requesterRole?: string;
}

export class PublishDealUseCase {
  constructor(private readonly dealRepository: IDealRepository) {}

  async execute(input: PublishDealInput): Promise<DealRecord> {
    const deal = await this.dealRepository.findById(input.dealId);
    if (!deal) throw new NotFoundError('Deal not found');

    if (deal.dealerId !== input.requesterId && input.requesterRole !== 'ADMIN') {
      throw new ForbiddenError('Access denied');
    }

    if (deal.status === 'PUBLISHED') {
      throw new BadRequestError('Deal is already published');
    }

    if (deal.status === 'EXPIRED') {
      throw new BadRequestError('Cannot publish an expired deal');
    }

    const now = new Date();
    if (deal.endDate <= now) {
      throw new BadRequestError('Cannot publish a deal whose end date is in the past');
    }

    return this.dealRepository.update(input.dealId, { status: 'PUBLISHED' });
  }
}
