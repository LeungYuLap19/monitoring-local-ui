import { useCallback, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { PetProfileListQuery, UseUserPetsOptions, UseUserPetsResult, UserPetListResult } from '../../types';
import { fetchUserPets } from '../../lib/services/petService';
import { petQueryKeys } from './petQueryKeys';

export function useUserPets(options: UseUserPetsOptions = {}): UseUserPetsResult {
  const { initialQuery = {}, autoLoad = true } = options;

  const [query, setQuery] = useState<PetProfileListQuery>(initialQuery);
  const [hasInitiated, setHasInitiated] = useState(autoLoad);
  const queryRef = useRef<PetProfileListQuery>(initialQuery);
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: petQueryKeys.list(query),
    queryFn: () => fetchUserPets(query),
    enabled: hasInitiated,
  });

  const pets = queryResult.data?.pets ?? [];
  const pagination = queryResult.data?.pagination ?? null;
  const isLoading = queryResult.isLoading || queryResult.isFetching;
  const hasLoaded = queryResult.isFetched;
  const error = queryResult.error instanceof Error ? queryResult.error : null;

  const loadPets = useCallback(async (nextQuery?: PetProfileListQuery): Promise<UserPetListResult> => {
    const resolvedQuery = nextQuery ?? queryRef.current;
    if (nextQuery) {
      queryRef.current = nextQuery;
      setQuery(nextQuery);
    }
    setHasInitiated(true);

    const result = await queryClient.fetchQuery({
      queryKey: petQueryKeys.list(resolvedQuery),
      queryFn: () => fetchUserPets(resolvedQuery),
    });

    return result;
  }, [queryClient]);

  const refreshPets = useCallback(async (): Promise<UserPetListResult> => {
    setHasInitiated(true);
    return queryClient.fetchQuery({
      queryKey: petQueryKeys.list(queryRef.current),
      queryFn: () => fetchUserPets(queryRef.current),
    });
  }, [queryClient]);

  const resetPets = useCallback(() => {
    queryClient.removeQueries({ queryKey: petQueryKeys.lists() });
  }, [queryClient]);

  return { pets, pagination, query, isLoading, hasLoaded, error, setQuery, loadPets, refreshPets, resetPets };
}
