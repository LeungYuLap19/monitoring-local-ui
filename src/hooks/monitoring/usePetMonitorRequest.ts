import { useCallback, useRef, useState } from 'react';
import type { RunPetMonitorRequestOptions } from '../../types';

const MAX_CONSECUTIVE_FAILURES = 1;

function toError(error: unknown, fallbackMessage: string): Error {
  return error instanceof Error ? error : new Error(fallbackMessage);
}

export function usePetMonitorRequest() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const requestSequenceRef = useRef(0);

  const runRequest = useCallback(async <TData,>(
    request: () => Promise<TData>,
    options: RunPetMonitorRequestOptions<TData>,
  ): Promise<TData> => {
    if (isBlocked) {
      return Promise.reject(new Error('PetMonitor requests are paused after a failed request. Click reconnect to try again.'));
    }

    const requestSequence = ++requestSequenceRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const data = await request();

      if (requestSequence === requestSequenceRef.current) {
        options.onSuccess?.(data);
        setHasLoaded(true);
        setConsecutiveFailures(0);
        setIsBlocked(false);
      }

      return data;
    } catch (error) {
      const normalizedError = toError(error, options.fallbackMessage);

      if (requestSequence === requestSequenceRef.current) {
        setError(normalizedError);
        setHasLoaded(true);
        options.onError?.(normalizedError);
        setConsecutiveFailures((currentFailures) => {
          const nextFailures = currentFailures + 1;
          if (nextFailures >= MAX_CONSECUTIVE_FAILURES) {
            setIsBlocked(true);
          }
          return nextFailures;
        });
      }

      throw normalizedError;
    } finally {
      if (requestSequence === requestSequenceRef.current) {
        setIsLoading(false);
      }
    }
  }, [isBlocked]);

  const resetRequest = useCallback(() => {
    requestSequenceRef.current += 1;
    setIsLoading(false);
    setHasLoaded(false);
    setError(null);
    setConsecutiveFailures(0);
    setIsBlocked(false);
  }, []);

  const reconnectRequest = useCallback(() => {
    requestSequenceRef.current += 1;
    setIsLoading(false);
    setError(null);
    setConsecutiveFailures(0);
    setIsBlocked(false);
  }, []);

  return {
    isLoading,
    hasLoaded,
    error,
    consecutiveFailures,
    isBlocked,
    runRequest,
    resetRequest,
    reconnectRequest,
  };
}
