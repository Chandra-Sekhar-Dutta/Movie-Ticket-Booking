import { useEffect, useRef } from 'react';

interface UsePollingOptions {
  interval?: number; // interval in milliseconds
  enabled?: boolean; // whether polling is enabled
  onError?: (error: any) => void;
  onSuccess?: () => void;
}

/**
 * Custom hook for polling data from an API
 * @param fetchFn - Async function to fetch data (memoize with useCallback to prevent recreation)
 * @param options - Polling configuration
 * @returns object with isPolling state
 */
export const usePolling = <T,>(
  fetchFn: () => Promise<T>,
  options: UsePollingOptions = {}
) => {
  const {
    interval = 5000, // Default 5 seconds
    enabled = true,
    onError,
    onSuccess,
  } = options;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchFnRef = useRef(fetchFn);

  // Update ref when fetchFn changes, but don't trigger useEffect
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    if (!enabled) return;

    const poll = async () => {
      try {
        await fetchFnRef.current();
        onSuccess?.();
      } catch (error) {
        onError?.(error);
      }
    };

    // Fetch immediately on mount
    poll();

    // Then set up interval
    intervalRef.current = setInterval(poll, interval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interval, enabled, onError, onSuccess]);

  return {
    isPolling: enabled,
  };
};

export default usePolling;
