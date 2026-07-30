import { useState } from 'react';
import type { ApiError } from '@/types';

interface UseAsyncActionReturn<TResult> {
  execute: (...args: Parameters<() => Promise<TResult>>) => Promise<TResult | undefined>;
  isLoading: boolean;
  error: ApiError | null;
  clearError: () => void;
}

/**
 * Generic hook for wrapping any async action (e.g. purchase, restock, delete)
 * with loading and error state.
 */
export function useAsyncAction<TResult>(
  action: (...args: unknown[]) => Promise<TResult>,
): UseAsyncActionReturn<TResult> {
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState<ApiError | null>(null);

  const execute = async (...args: unknown[]) => {
    setLoading(true);
    setError(null);
    try {
      const result = await action(...args);
      return result;
    } catch (err) {
      setError(err as ApiError);
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  return {
    execute: execute as UseAsyncActionReturn<TResult>['execute'],
    isLoading,
    error,
    clearError: () => setError(null),
  };
}
