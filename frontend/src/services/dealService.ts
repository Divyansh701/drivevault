import apiClient from './apiClient';
import type { Deal, CreateDealDto, UpdateDealDto, DealQueryParams, DealListResponse } from '@/types';

const DEALER_ENDPOINT = '/deals';
const PUBLIC_ENDPOINT = '/public/deals';

interface SingleDealResponse {
  status: string;
  data: { deal: Deal };
}

interface DealListApiResponse {
  status: string;
  data: DealListResponse;
}

// ─── Deal Service ─────────────────────────────────────────────────────────────

export const dealService = {

  // ── Dealer (protected) ──────────────────────────────────────────────────────

  /**
   * List deals for the authenticated dealer (their own deals only).
   */
  async getMyDeals(params?: DealQueryParams): Promise<DealListResponse> {
    const { data } = await apiClient.get<DealListApiResponse>(DEALER_ENDPOINT, { params });
    return data.data;
  },

  /**
   * Get a single deal by ID (dealer view — can access own + public deals).
   */
  async getById(id: string): Promise<Deal> {
    const { data } = await apiClient.get<SingleDealResponse>(`${DEALER_ENDPOINT}/${id}`);
    return data.data.deal;
  },

  /**
   * Create a new deal (dealers only).
   */
  async create(payload: CreateDealDto): Promise<Deal> {
    const { data } = await apiClient.post<SingleDealResponse>(DEALER_ENDPOINT, payload);
    return data.data.deal;
  },

  /**
   * Update an existing deal (owner only).
   */
  async update(id: string, payload: UpdateDealDto): Promise<Deal> {
    const { data } = await apiClient.patch<SingleDealResponse>(`${DEALER_ENDPOINT}/${id}`, payload);
    return data.data.deal;
  },

  /**
   * Delete a deal (soft delete, owner only).
   */
  async remove(id: string): Promise<void> {
    await apiClient.delete(`${DEALER_ENDPOINT}/${id}`);
  },

  /**
   * Publish a deal — makes it live and visible to the public.
   */
  async publish(id: string): Promise<Deal> {
    const { data } = await apiClient.post<SingleDealResponse>(`${DEALER_ENDPOINT}/${id}/publish`);
    return data.data.deal;
  },

  /**
   * Unpublish a deal — sets status back to DRAFT.
   */
  async unpublish(id: string): Promise<Deal> {
    const { data } = await apiClient.post<SingleDealResponse>(`${DEALER_ENDPOINT}/${id}/unpublish`);
    return data.data.deal;
  },

  // ── Public (no auth required) ───────────────────────────────────────────────

  /**
   * List all active, published deals for public browsing.
   * Optionally filter by vehicleId or featured flag.
   */
  async getPublicDeals(params?: { vehicleId?: string; limit?: number; featured?: boolean }): Promise<Deal[]> {
    const { data } = await apiClient.get<{ status: string; data: { deals: Deal[]; totalCount: number } }>(
      PUBLIC_ENDPOINT,
      { params },
    );
    return data.data.deals;
  },

  /**
   * Get a single public deal by ID (no auth required if it's active/published).
   */
  async getPublicById(id: string): Promise<Deal> {
    const { data } = await apiClient.get<SingleDealResponse>(`${PUBLIC_ENDPOINT}/${id}`);
    return data.data.deal;
  },
};
