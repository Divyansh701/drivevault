import { useState, useEffect } from 'react';
import { vehicleService } from '@/services';
import type { Vehicle, ApiError } from '@/types';

interface UseVehicleReturn {
  vehicle: Vehicle | null;
  isLoading: boolean;
  error: ApiError | null;
}

/**
 * Fetch a single vehicle by ID.
 */
export function useVehicle(id: string): UseVehicleReturn {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]       = useState<ApiError | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await vehicleService.getById(id);
        if (!cancelled) setVehicle(data);
      } catch (err) {
        if (!cancelled) setError(err as ApiError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [id]);

  return { vehicle, isLoading, error };
}
