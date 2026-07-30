import apiClient from './apiClient';
import type { HealthStatus } from '@/types';

// ─── Health Service ───────────────────────────────────────────────────────────

export const healthService = {
  async check(): Promise<HealthStatus> {
    const { data } = await apiClient.get<HealthStatus>('/health');
    return data;
  },
};
