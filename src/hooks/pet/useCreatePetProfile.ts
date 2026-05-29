import { useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type {
  PetProfileCreatePayload,
  PetProfileCreateResult,
  PetProfileMultipartOptions,
  UseCreatePetProfileResult,
} from '../../types';
import { createPetProfile } from '../../lib/services/petService';
import { petQueryKeys } from './petQueryKeys';

function toError(error: unknown, fallbackMessage: string): Error {
  return error instanceof Error ? error : new Error(fallbackMessage);
}

export function useCreatePetProfile(): UseCreatePetProfileResult {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const requestSequenceRef = useRef(0);

  const createPet = useCallback<UseCreatePetProfileResult['createPet']>(async (payload, options) => {
    const requestSequence = ++requestSequenceRef.current;
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const result = await createPetProfile(payload, options);

      if (requestSequence === requestSequenceRef.current) {
        setHasSubmitted(true);
        setMessage(result.message ?? null);
      }

      await queryClient.invalidateQueries({ queryKey: petQueryKeys.lists() });

      return result;
    } catch (err) {
      const normalizedError = toError(err, 'Failed to create pet profile');

      if (requestSequence === requestSequenceRef.current) {
        setError(normalizedError);
        setHasSubmitted(true);
      }

      throw normalizedError;
    } finally {
      if (requestSequence === requestSequenceRef.current) {
        setIsSubmitting(false);
      }
    }
  }, [queryClient]);

  const resetCreateState = useCallback(() => {
    requestSequenceRef.current += 1;
    setIsSubmitting(false);
    setHasSubmitted(false);
    setError(null);
    setMessage(null);
  }, []);

  return {
    isSubmitting,
    hasSubmitted,
    error,
    message,
    createPet,
    resetCreateState,
  };
}