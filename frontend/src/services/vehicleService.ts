import apiClient from './apiClient';
import type {
  Vehicle,
  CreateVehicleDto,
  UpdateVehicleDto,
  RestockDto,
  VehicleQueryParams,
  VehicleListResponse,
  PaginationMeta,
} from '@/types';

const ENDPOINT = '/vehicles';

interface SingleVehicleResponse {
  status: string;
  data: {
    vehicle: Vehicle;
  };
}

// ─── Vehicle Service ──────────────────────────────────────────────────────────

export const vehicleService = {
  /**
   * Fetch all vehicles with optional filtering / pagination.
   */
  async getAll(params?: VehicleQueryParams): Promise<{ vehicles: Vehicle[]; pagination: PaginationMeta }> {
    const { data } = await apiClient.get<VehicleListResponse>(ENDPOINT, { params });
    return data.data;
  },

  /**
   * Fetch a single vehicle by ID.
   */
  async getById(id: string): Promise<Vehicle> {
    const { data } = await apiClient.get<SingleVehicleResponse>(`${ENDPOINT}/${id}`);
    return data.data.vehicle;
  },

  /**
   * Create a new vehicle (admin only).
   */
  async create(payload: CreateVehicleDto): Promise<Vehicle> {
    const { data } = await apiClient.post<SingleVehicleResponse>(ENDPOINT, payload);
    return data.data.vehicle;
  },

  /**
   * Update an existing vehicle (admin/staff — partial update via PATCH).
   */
  async update(id: string, payload: UpdateVehicleDto): Promise<Vehicle> {
    const { data } = await apiClient.patch<SingleVehicleResponse>(`${ENDPOINT}/${id}`, payload);
    return data.data.vehicle;
  },

  /**
   * Delete a vehicle (admin only).
   */
  async remove(id: string): Promise<void> {
    await apiClient.delete(`${ENDPOINT}/${id}`);
  },

  /**
   * Purchase a vehicle — decrements quantity.
   */
  async purchase(id: string): Promise<Vehicle> {
    const { data } = await apiClient.post<SingleVehicleResponse>(`${ENDPOINT}/${id}/purchase`);
    return data.data.vehicle;
  },

  /**
   * Restock a vehicle (admin only) — increments quantity.
   */
  async restock(id: string, payload: RestockDto): Promise<Vehicle> {
    const { data } = await apiClient.post<SingleVehicleResponse>(
      `${ENDPOINT}/${id}/restock`,
      payload,
    );
    return data.data.vehicle;
  },
};
