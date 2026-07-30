/**
 * MongoDBVehicleRepository — concrete implementation of IVehicleRepository using Mongoose.
 *
 * DIP compliance:
 * - Depends on the domain interface IVehicleRepository (lives in domain layer)
 * - Use cases depend on the interface, not this concrete class
 * - This implementation can be swapped without changing any use case code
 *
 * Features:
 * - Complex filtering (make, model, category, powertrain, status, price range, year range)
 * - Pagination with configurable page size
 * - Sorting by multiple fields (price, year, make, model, createdAt, updatedAt)
 * - Soft delete support (deletedAt !== null)
 */

import {
  IVehicleRepository,
  VehicleRecord,
  VehicleFilters,
  CreateVehicleData,
  UpdateVehicleData,
  SortOptions,
} from '../../domain/repositories/IVehicleRepository';
import { VehicleModel, IVehicleDocument } from '../database/schemas';
import { FilterQuery } from 'mongoose';
import { NotFoundError } from '../../shared/errors';

export class MongoDBVehicleRepository implements IVehicleRepository {
  /**
   * Convert Mongoose document to domain VehicleRecord.
   * Removes MongoDB-specific fields and maps _id to id.
   * Price is converted to string to match domain interface.
   */
  private toDomainModel(doc: IVehicleDocument): VehicleRecord {
    return {
      id: doc._id.toString(),
      make: doc.make,
      model: doc.model,
      year: doc.year,
      category: doc.category,
      powertrain: doc.powertrain,
      price: doc.price.toFixed(2), // Convert number to decimal string
      quantity: doc.quantity,
      vin: doc.vin,
      color: doc.color,
      mileage: doc.mileage,
      description: doc.description,
      status: doc.status,
      imageUrls: doc.imageUrls,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      deletedAt: doc.deletedAt,
    };
  }

  /**
   * Build MongoDB filter query from domain filters.
   * All filters are optional and combined with AND logic.
   */
  private buildFilterQuery(filters: VehicleFilters): FilterQuery<IVehicleDocument> {
    const query: FilterQuery<IVehicleDocument> = {
      deletedAt: null, // Always exclude soft-deleted vehicles
    };

    // Exact matches
    if (filters.make) {
      query.make = new RegExp(`^${filters.make}$`, 'i'); // Case-insensitive exact match
    }
    if (filters.model) {
      query.model = new RegExp(`^${filters.model}$`, 'i');
    }
    if (filters.category) {
      query.category = filters.category;
    }
    if (filters.powertrain) {
      query.powertrain = filters.powertrain;
    }
    if (filters.status) {
      query.status = filters.status;
    }

    // Price range
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) {
        query.price.$gte = parseFloat(filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        query.price.$lte = parseFloat(filters.maxPrice);
      }
    }

    // Year filters
    if (filters.year !== undefined) {
      query.year = filters.year;
    } else {
      // Year range (only if exact year not specified)
      if (filters.minYear !== undefined || filters.maxYear !== undefined) {
        query.year = {};
        if (filters.minYear !== undefined) {
          query.year.$gte = filters.minYear;
        }
        if (filters.maxYear !== undefined) {
          query.year.$lte = filters.maxYear;
        }
      }
    }

    return query;
  }

  /**
   * Build MongoDB sort object from domain sort options.
   */
  private buildSortQuery(sort?: SortOptions): Record<string, 1 | -1> {
    if (!sort) {
      return { createdAt: -1 }; // Default: newest first
    }

    const order = sort.order === 'asc' ? 1 : -1;
    return { [sort.field]: order };
  }

  /**
   * Return a filtered, paginated list of active (non-deleted) vehicles.
   *
   * @param filters Optional field-level filters
   * @param page    1-based page number
   * @param limit   Maximum records per page
   * @param sort    Optional sort options
   */
  async findAll(
    filters: VehicleFilters,
    page: number,
    limit: number,
    sort?: SortOptions,
  ): Promise<VehicleRecord[]> {
    // Ensure page is at least 1
    const currentPage = Math.max(1, page);
    const skip = (currentPage - 1) * limit;

    const filterQuery = this.buildFilterQuery(filters);
    const sortQuery = this.buildSortQuery(sort);

    const vehicles = await VehicleModel.find(filterQuery)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .exec();

    return vehicles.map((vehicle) => this.toDomainModel(vehicle));
  }

  /**
   * Find a single active vehicle by primary key.
   * Returns null when the vehicle does not exist or has been soft-deleted.
   */
  async findById(id: string): Promise<VehicleRecord | null> {
    const vehicle = await VehicleModel.findOne({
      _id: id,
      deletedAt: null,
    }).exec();

    return vehicle ? this.toDomainModel(vehicle) : null;
  }

  /**
   * Find a single active vehicle by VIN.
   * Returns null when no match is found.
   */
  async findByVin(vin: string): Promise<VehicleRecord | null> {
    if (!vin) return null;

    const vehicle = await VehicleModel.findOne({
      vin: vin.toUpperCase(),
      deletedAt: null,
    }).exec();

    return vehicle ? this.toDomainModel(vehicle) : null;
  }

  /**
   * Count active vehicles matching the given filters.
   * Used to compute total-pages metadata for paginated responses.
   */
  async count(filters: VehicleFilters): Promise<number> {
    const filterQuery = this.buildFilterQuery(filters);
    return VehicleModel.countDocuments(filterQuery).exec();
  }

  /**
   * Persist a new vehicle and return the created record.
   */
  async create(data: CreateVehicleData): Promise<VehicleRecord> {
    const vehicle = new VehicleModel({
      make: data.make,
      model: data.model,
      year: data.year,
      category: data.category,
      powertrain: data.powertrain,
      price: parseFloat(data.price),
      quantity: data.quantity,
      vin: data.vin?.toUpperCase() || null,
      color: data.color || null,
      mileage: data.mileage || 0,
      description: data.description || null,
      status: data.status || 'AVAILABLE',
      imageUrls: data.imageUrls || [],
      deletedAt: null,
    });

    const savedVehicle = await vehicle.save();
    return this.toDomainModel(savedVehicle);
  }

  /**
   * Apply a partial update to an existing vehicle.
   * Only the fields present in `data` are changed.
   */
  async update(id: string, data: UpdateVehicleData): Promise<VehicleRecord> {
    // Prepare update object - only include fields that are present
    const updateData: Partial<IVehicleDocument> = {};

    if (data.make !== undefined) updateData.make = data.make;
    if (data.model !== undefined) updateData.model = data.model;
    if (data.year !== undefined) updateData.year = data.year;
    if (data.category !== undefined) updateData.category = data.category as any;
    if (data.powertrain !== undefined) updateData.powertrain = data.powertrain as any;
    if (data.price !== undefined) updateData.price = parseFloat(data.price);
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.vin !== undefined) updateData.vin = data.vin ? data.vin.toUpperCase() : null;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.mileage !== undefined) updateData.mileage = data.mileage;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status as any;
    if (data.imageUrls !== undefined) updateData.imageUrls = data.imageUrls;

    const updatedVehicle = await VehicleModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: updateData },
      { new: true, runValidators: true }
    ).exec();

    if (!updatedVehicle) {
      throw new NotFoundError(`Vehicle with id ${id} not found or has been deleted`);
    }

    return this.toDomainModel(updatedVehicle);
  }

  /**
   * Soft-delete a vehicle by setting deletedAt to the current timestamp.
   * The row is retained so sold/historical records are never lost.
   */
  async softDelete(id: string): Promise<void> {
    const result = await VehicleModel.updateOne(
      { _id: id, deletedAt: null },
      { $set: { deletedAt: new Date() } }
    ).exec();

    if (result.matchedCount === 0) {
      throw new NotFoundError(`Vehicle with id ${id} not found or already deleted`);
    }
  }
}
