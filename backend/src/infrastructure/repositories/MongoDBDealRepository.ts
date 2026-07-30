/**
 * MongoDBDealRepository — concrete implementation of IDealRepository using Mongoose.
 *
 * DIP compliance:
 * - Depends on the domain interface IDealRepository (lives in domain layer)
 * - Use cases depend on the interface, not this concrete class
 * - This implementation can be swapped without changing any use case code
 *
 * Features:
 * - Complex filtering (dealer, vehicle, status, date ranges, active-only)
 * - Pagination with configurable page size
 * - Soft delete support (deletedAt !== null)
 * - Auto status update for expired deals
 * - Public API methods (no sensitive dealer data)
 */

import {
  IDealRepository,
  DealRecord,
  DealFilters,
  CreateDealData,
  UpdateDealData,
} from '../../domain/repositories/IDealRepository';
import { DealModel, DealStatus, IDealDocument } from '../database/schemas';
import { FilterQuery } from 'mongoose';
import { NotFoundError } from '../../shared/errors';

export class MongoDBDealRepository implements IDealRepository {
  /**
   * Convert Mongoose document to domain DealRecord.
   * Removes MongoDB-specific fields and maps _id to id.
   */
  private toDomainModel(doc: IDealDocument): DealRecord {
    return {
      id: doc._id.toString(),
      title: doc.title,
      description: doc.description,
      dealerId: doc.dealerId,
      dealerName: doc.dealerName,
      vehicleId: doc.vehicleId,
      vehicleMake: doc.vehicleMake,
      vehicleModel: doc.vehicleModel,
      vehicleYear: doc.vehicleYear,
      discountType: doc.discountType,
      discountValue: doc.discountValue,
      originalPrice: doc.originalPrice,
      offerPrice: doc.offerPrice,
      startDate: doc.startDate,
      endDate: doc.endDate,
      status: doc.status,
      isFeatured: doc.isFeatured,
      bannerImageUrl: doc.bannerImageUrl,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      deletedAt: doc.deletedAt,
    };
  }

  /**
   * Build MongoDB filter query from domain filters.
   * All filters are optional and combined with AND logic.
   */
  private buildFilterQuery(filters: DealFilters): FilterQuery<IDealDocument> {
    const query: FilterQuery<IDealDocument> = {
      deletedAt: null, // Always exclude soft-deleted deals
    };

    // Dealer filter
    if (filters.dealerId) {
      query.dealerId = filters.dealerId;
    }

    // Vehicle filter
    if (filters.vehicleId) {
      query.vehicleId = filters.vehicleId;
    }

    // Status filter
    if (filters.status) {
      query.status = filters.status;
    }

    // Featured filter
    if (filters.isFeatured !== undefined) {
      query.isFeatured = filters.isFeatured;
    }

    // Active deals filter (published + within date range)
    if (filters.activeOnly) {
      const now = new Date();
      query.status = DealStatus.PUBLISHED;
      query.startDate = { $lte: now };
      query.endDate = { $gte: now };
    }

    return query;
  }

  /**
   * Find a single deal by primary key.
   * Returns null if not found or soft-deleted.
   */
  async findById(id: string): Promise<DealRecord | null> {
    const deal = await DealModel.findOne({
      _id: id,
      deletedAt: null,
    }).exec();

    if (!deal) return null;

    // Auto-update status if expired
    deal.updateStatusIfExpired();
    if (deal.isModified('status')) {
      await deal.save();
    }

    return this.toDomainModel(deal);
  }

  /**
   * Return paginated deals matching the given filters.
   * Default sort: newest first (createdAt desc).
   */
  async findAll(
    filters: DealFilters,
    page: number,
    limit: number,
  ): Promise<DealRecord[]> {
    // Ensure page is at least 1
    const currentPage = Math.max(1, page);
    const skip = (currentPage - 1) * limit;

    const filterQuery = this.buildFilterQuery(filters);

    const deals = await DealModel.find(filterQuery)
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .exec();

    // Batch-update expired deals in a single bulkWrite instead of N individual saves
    const now = new Date();
    const expiredIds = deals
      .filter((deal) => deal.status === DealStatus.PUBLISHED && deal.endDate <= now)
      .map((deal) => deal._id);

    if (expiredIds.length > 0) {
      await DealModel.bulkWrite([
        {
          updateMany: {
            filter: { _id: { $in: expiredIds } },
            update: { $set: { status: DealStatus.EXPIRED } },
          },
        },
      ]);
      // Update in-memory objects to reflect the change
      deals.forEach((deal) => {
        if (expiredIds.some((id) => id.toString() === deal._id.toString())) {
          deal.status = DealStatus.EXPIRED;
        }
      });
    }

    return deals.map((deal) => this.toDomainModel(deal));
  }

  /**
   * Count deals matching filters (for pagination metadata).
   */
  async count(filters: DealFilters): Promise<number> {
    const filterQuery = this.buildFilterQuery(filters);
    return DealModel.countDocuments(filterQuery).exec();
  }

  /**
   * Return all currently active, published, non-expired deals.
   * Used by the public API — requires no authentication.
   * Limited to prevent excessive data transfer.
   */
  async findPublicActive(limit: number = 50): Promise<DealRecord[]> {
    const now = new Date();
    
    const deals = await DealModel.find({
      status: DealStatus.PUBLISHED,
      startDate: { $lte: now },
      endDate: { $gte: now },
      deletedAt: null,
    })
      .sort({ 
        isFeatured: -1, // Featured deals first
        createdAt: -1,  // Then newest first
      })
      .limit(limit)
      .exec();

    return deals.map((deal) => this.toDomainModel(deal));
  }

  /**
   * Return active deals for a specific vehicle (for the vehicle detail page).
   */
  async findActiveByVehicle(vehicleId: string): Promise<DealRecord[]> {
    const now = new Date();
    
    const deals = await DealModel.find({
      vehicleId,
      status: DealStatus.PUBLISHED,
      startDate: { $lte: now },
      endDate: { $gte: now },
      deletedAt: null,
    })
      .sort({ createdAt: -1 })
      .exec();

    return deals.map((deal) => this.toDomainModel(deal));
  }

  /**
   * Persist a new deal and return the created record.
   */
  async create(data: CreateDealData): Promise<DealRecord> {
    const deal = new DealModel({
      title: data.title,
      description: data.description || null,
      dealerId: data.dealerId,
      dealerName: data.dealerName,
      vehicleId: data.vehicleId || null,
      vehicleMake: data.vehicleMake || null,
      vehicleModel: data.vehicleModel || null,
      vehicleYear: data.vehicleYear || null,
      discountType: data.discountType,
      discountValue: data.discountValue,
      originalPrice: data.originalPrice,
      offerPrice: data.offerPrice,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status || DealStatus.DRAFT,
      isFeatured: data.isFeatured || false,
      bannerImageUrl: data.bannerImageUrl || null,
      deletedAt: null,
    });

    const savedDeal = await deal.save();
    return this.toDomainModel(savedDeal);
  }

  /**
   * Apply a partial update to an existing deal.
   * Only the fields present in `data` are changed.
   * Ownership is enforced at the use-case layer before this is called.
   */
  async update(id: string, data: UpdateDealData): Promise<DealRecord> {
    // Prepare update object - only include fields that are present
    const updateData: Partial<IDealDocument> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.vehicleId !== undefined) updateData.vehicleId = data.vehicleId;
    if (data.vehicleMake !== undefined) updateData.vehicleMake = data.vehicleMake;
    if (data.vehicleModel !== undefined) updateData.vehicleModel = data.vehicleModel;
    if (data.vehicleYear !== undefined) updateData.vehicleYear = data.vehicleYear;
    if (data.discountType !== undefined) updateData.discountType = data.discountType as any;
    if (data.discountValue !== undefined) updateData.discountValue = data.discountValue;
    if (data.originalPrice !== undefined) updateData.originalPrice = data.originalPrice;
    if (data.offerPrice !== undefined) updateData.offerPrice = data.offerPrice;
    if (data.startDate !== undefined) updateData.startDate = data.startDate;
    if (data.endDate !== undefined) updateData.endDate = data.endDate;
    if (data.status !== undefined) updateData.status = data.status as any;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.bannerImageUrl !== undefined) updateData.bannerImageUrl = data.bannerImageUrl;

    const updatedDeal = await DealModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: updateData },
      { new: true, runValidators: true }
    ).exec();

    if (!updatedDeal) {
      throw new Error(`Deal with id ${id} not found or has been deleted`);
    }

    return this.toDomainModel(updatedDeal);
  }

  /**
   * Soft-delete a deal by setting deletedAt to the current timestamp.
   * The row is retained so deal history and analytics are never lost.
   */
  async softDelete(id: string): Promise<void> {
    const result = await DealModel.updateOne(
      { _id: id, deletedAt: null },
      { $set: { deletedAt: new Date() } }
    ).exec();

    if (result.matchedCount === 0) {
      throw new NotFoundError(`Deal with id ${id} not found or has been deleted`);
    }
  }

  /**
   * Change deal status to PUBLISHED (make it live).
   * Performs validation to ensure the deal is valid for publishing.
   */
  async publish(id: string): Promise<DealRecord> {
    const deal = await DealModel.findOne({
      _id: id,
      deletedAt: null,
    }).exec();

    if (!deal) {
      throw new NotFoundError(`Deal with id ${id} not found or has been deleted`);
    }

    // Validate that the deal can be published
    const now = new Date();
    if (deal.endDate <= now) {
      throw new Error('Cannot publish deal that has already expired');
    }

    if (deal.startDate > deal.endDate) {
      throw new Error('Cannot publish deal where start date is after end date');
    }

    // Update status to published
    deal.status = DealStatus.PUBLISHED;
    const savedDeal = await deal.save();

    return this.toDomainModel(savedDeal);
  }

  /**
   * Change deal status to DRAFT (unpublish it).
   */
  async unpublish(id: string): Promise<DealRecord> {
    const deal = await DealModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: { status: DealStatus.DRAFT } },
      { new: true, runValidators: true }
    ).exec();

    if (!deal) {
      throw new NotFoundError(`Deal with id ${id} not found or has been deleted`);
    }

    return this.toDomainModel(deal);
  }

  /**
   * Search deals by title or description using MongoDB text search.
   * Useful for dealer dashboard search functionality.
   */
  async search(
    searchQuery: string,
    filters: DealFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<DealRecord[]> {
    const currentPage = Math.max(1, page);
    const skip = (currentPage - 1) * limit;

    // Build base filter query
    const filterQuery = this.buildFilterQuery(filters);

    // Add text search to the query
    const searchFilter = {
      ...filterQuery,
      $text: { $search: searchQuery },
    };

    const deals = await DealModel.find(searchFilter)
      .sort({ score: { $meta: 'textScore' } }) // Sort by relevance
      .skip(skip)
      .limit(limit)
      .exec();

    return deals.map((deal) => this.toDomainModel(deal));
  }

  /**
   * Get deals that are expiring soon (within the next N days).
   * Useful for dealer notifications and dashboard alerts.
   */
  async findExpiringSoon(dealerId: string, daysAhead: number = 7): Promise<DealRecord[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + daysAhead);

    const deals = await DealModel.find({
      dealerId,
      status: DealStatus.PUBLISHED,
      endDate: {
        $gte: now,
        $lte: futureDate,
      },
      deletedAt: null,
    })
      .sort({ endDate: 1 }) // Earliest expiry first
      .exec();

    return deals.map((deal) => this.toDomainModel(deal));
  }

  /**
   * Get performance statistics for a dealer's deals.
   * Returns counts by status and other metrics.
   */
  async getDealStats(dealerId: string): Promise<{
    totalDeals: number;
    draftDeals: number;
    publishedDeals: number;
    expiredDeals: number;
    featuredDeals: number;
    expiringSoon: number;
  }> {
    const pipeline = [
      {
        $match: {
          dealerId,
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: null,
          totalDeals: { $sum: 1 },
          draftDeals: {
            $sum: { $cond: [{ $eq: ['$status', DealStatus.DRAFT] }, 1, 0] },
          },
          publishedDeals: {
            $sum: { $cond: [{ $eq: ['$status', DealStatus.PUBLISHED] }, 1, 0] },
          },
          expiredDeals: {
            $sum: { $cond: [{ $eq: ['$status', DealStatus.EXPIRED] }, 1, 0] },
          },
          featuredDeals: {
            $sum: { $cond: ['$isFeatured', 1, 0] },
          },
        },
      },
    ];

    const result = await DealModel.aggregate(pipeline).exec();
    const stats = result[0] || {
      totalDeals: 0,
      draftDeals: 0,
      publishedDeals: 0,
      expiredDeals: 0,
      featuredDeals: 0,
    };

    // Count deals expiring in the next 7 days
    const expiringSoonDeals = await this.findExpiringSoon(dealerId, 7);
    stats.expiringSoon = expiringSoonDeals.length;

    return stats;
  }
}