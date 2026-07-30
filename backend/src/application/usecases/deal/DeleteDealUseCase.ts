import { IDealRepository } from '../../../domain/repositories/IDealRepository';
import { ForbiddenError, NotFoundError } from '../../../shared/errors';

export interface DeleteDealInput {
  dealId: string;
  requesterId: string;
  requesterRole?: string;
}

export class DeleteDealUseCase {
  constructor(private readonly dealRepository: IDealRepository) {}

  async execute(input: DeleteDealInput): Promise<void> {
    const existing = await this.dealRepository.findById(input.dealId);
    if (!existing) throw new NotFoundError('Deal not found');

    if (existing.dealerId !== input.requesterId && input.requesterRole !== 'ADMIN') {
      throw new ForbiddenError('Access denied');
    }

    await this.dealRepository.softDelete(input.dealId);
  }
}
