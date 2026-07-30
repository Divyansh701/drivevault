/**
 * InMemoryVehicleRepository — in-process IVehicleRepository for dev/test.
 *
 * Swapped for PrismaVehicleRepository in production at the composition root.
 * No use-case or controller code changes when the swap is made.
 */

import { randomUUID } from 'crypto';
import type {
  IVehicleRepository,
  VehicleRecord,
  VehicleFilters,
  SortOptions,
  CreateVehicleData,
  UpdateVehicleData,
} from '../../domain/repositories/IVehicleRepository';

export class InMemoryVehicleRepository implements IVehicleRepository {
  private readonly store = new Map<string, VehicleRecord>();

  // ---------------------------------------------------------------------------
  // Reads
  // ---------------------------------------------------------------------------

  async findAll(
    filters: VehicleFilters,
    page: number,
    limit: number,
    sort?: SortOptions,
  ): Promise<VehicleRecord[]> {
    let results = [...this.store.values()].filter((v) => v.deletedAt === null);

    if (filters.make)       results = results.filter((v) => v.make.toLowerCase().includes(filters.make!.toLowerCase()));
    if (filters.model)      results = results.filter((v) => v.model.toLowerCase().includes(filters.model!.toLowerCase()));
    if (filters.category)   results = results.filter((v) => v.category.toLowerCase() === filters.category!.toLowerCase());
    if (filters.powertrain) results = results.filter((v) => v.powertrain.toLowerCase() === filters.powertrain!.toLowerCase());
    if (filters.status)     results = results.filter((v) => v.status.toLowerCase() === filters.status!.toLowerCase());
    if (filters.year)       results = results.filter((v) => v.year === filters.year);
    if (filters.minPrice)   results = results.filter((v) => parseFloat(v.price) >= parseFloat(filters.minPrice!));
    if (filters.maxPrice)   results = results.filter((v) => parseFloat(v.price) <= parseFloat(filters.maxPrice!));
    if (filters.minYear)    results = results.filter((v) => v.year >= filters.minYear!);
    if (filters.maxYear)    results = results.filter((v) => v.year <= filters.maxYear!);

    if (sort) {
      const { field, order } = sort;
      results.sort((a, b) => {
        let valA: string | number | Date = a[field as keyof VehicleRecord] as any;
        let valB: string | number | Date = b[field as keyof VehicleRecord] as any;

        if (field === 'price') {
          valA = parseFloat(a.price);
          valB = parseFloat(b.price);
        } else if (valA instanceof Date && valB instanceof Date) {
          valA = valA.getTime();
          valB = valB.getTime();
        }

        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const start = (page - 1) * limit;
    return results.slice(start, start + limit);
  }

  async findById(id: string): Promise<VehicleRecord | null> {
    const v = this.store.get(id);
    if (!v || v.deletedAt !== null) return null;
    return v;
  }

  async findByVin(vin: string): Promise<VehicleRecord | null> {
    for (const v of this.store.values()) {
      if (v.vin === vin && v.deletedAt === null) return v;
    }
    return null;
  }

  async count(filters: VehicleFilters): Promise<number> {
    let results = [...this.store.values()].filter((v) => v.deletedAt === null);

    if (filters.make)       results = results.filter((v) => v.make.toLowerCase().includes(filters.make!.toLowerCase()));
    if (filters.model)      results = results.filter((v) => v.model.toLowerCase().includes(filters.model!.toLowerCase()));
    if (filters.category)   results = results.filter((v) => v.category.toLowerCase() === filters.category!.toLowerCase());
    if (filters.powertrain) results = results.filter((v) => v.powertrain.toLowerCase() === filters.powertrain!.toLowerCase());
    if (filters.status)     results = results.filter((v) => v.status.toLowerCase() === filters.status!.toLowerCase());
    if (filters.year)       results = results.filter((v) => v.year === filters.year);
    if (filters.minPrice)   results = results.filter((v) => parseFloat(v.price) >= parseFloat(filters.minPrice!));
    if (filters.maxPrice)   results = results.filter((v) => parseFloat(v.price) <= parseFloat(filters.maxPrice!));
    if (filters.minYear)    results = results.filter((v) => v.year >= filters.minYear!);
    if (filters.maxYear)    results = results.filter((v) => v.year <= filters.maxYear!);

    return results.length;
  }

  // ---------------------------------------------------------------------------
  // Writes
  // ---------------------------------------------------------------------------

  async create(data: CreateVehicleData): Promise<VehicleRecord> {
    const now = new Date();
    const record: VehicleRecord = {
      id:          randomUUID(),
      make:        data.make,
      model:       data.model,
      year:        data.year,
      category:    data.category,
      powertrain:  data.powertrain,
      price:       data.price,
      quantity:    data.quantity,
      vin:         data.vin    ?? null,
      color:       data.color  ?? null,
      mileage:     data.mileage     ?? 0,
      description: data.description ?? null,
      status:      data.status      ?? 'AVAILABLE',
      imageUrls:   data.imageUrls   ?? [],
      createdAt:   now,
      updatedAt:   now,
      deletedAt:   null,
    };
    this.store.set(record.id, record);
    return record;
  }

  async update(id: string, data: UpdateVehicleData): Promise<VehicleRecord> {
    const existing = this.store.get(id);
    if (!existing || existing.deletedAt !== null) {
      throw new Error(`Vehicle ${id} not found`);
    }

    const updated: VehicleRecord = {
      ...existing,
      ...(data.make        !== undefined && { make:        data.make }),
      ...(data.model       !== undefined && { model:       data.model }),
      ...(data.year        !== undefined && { year:        data.year }),
      ...(data.category    !== undefined && { category:    data.category }),
      ...(data.powertrain  !== undefined && { powertrain:  data.powertrain }),
      ...(data.price       !== undefined && { price:       data.price }),
      ...(data.quantity    !== undefined && { quantity:    data.quantity }),
      ...(data.vin         !== undefined && { vin:         data.vin }),
      ...(data.color       !== undefined && { color:       data.color }),
      ...(data.mileage     !== undefined && { mileage:     data.mileage }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status      !== undefined && { status:      data.status }),
      ...(data.imageUrls   !== undefined && { imageUrls:   data.imageUrls }),
      updatedAt: new Date(),
    };

    this.store.set(id, updated);
    return updated;
  }

  async softDelete(id: string): Promise<void> {
    const existing = this.store.get(id);
    if (existing && existing.deletedAt === null) {
      this.store.set(id, { ...existing, deletedAt: new Date() });
    }
  }

  /** Test utility — wipe all records. */
  clear(): void {
    this.store.clear();
  }
}
