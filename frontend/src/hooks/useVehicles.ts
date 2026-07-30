import { useState, useEffect, useCallback } from 'react';
import { vehicleService } from '@/services';
import type { Vehicle, VehicleQueryParams, PaginationMeta, ApiError } from '@/types';

interface UseVehiclesReturn {
  vehicles: Vehicle[];
  total: number;
  totalPages: number;
  page: number;
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
}

/**
 * Fetch a paginated list of vehicles with optional filters.
 */
export function useVehicles(params?: VehicleQueryParams): UseVehiclesReturn {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [isLoading, setLoading] = useState(true);
  const [error, setError]       = useState<ApiError | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vehicleService.getAll(params);
      setVehicles(data.vehicles);
      setPagination(data.pagination);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return {
    vehicles,
    total: pagination.total,
    totalPages: pagination.totalPages,
    page: pagination.page,
    isLoading,
    error,
    refetch: fetch,
  };
}
