import { useCallback, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  PetProfileView,
  PetProfileViewMap,
  UsePetProfileOptions,
  UsePetProfileResult,
} from '../../types';
import { fetchPetProfileById } from '../../lib/services/petService';
import { petQueryKeys } from './petQueryKeys';

export function usePetProfile<TView extends PetProfileView = 'full'>(
  options: UsePetProfileOptions<TView> = {},
): UsePetProfileResult<TView> {
  const {
    initialPetId = null,
    initialView = 'full' as TView,
    autoLoad = Boolean(initialPetId),
  } = options;

  const [petId, setPetId] = useState<string | null>(initialPetId);
  const [view, setView] = useState<TView>(initialView);
  const petIdRef = useRef<string | null>(initialPetId);
  const viewRef = useRef<TView>(initialView);
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: petQueryKeys.detail(petId ?? '', view),
    queryFn: () => fetchPetProfileById<TView>(petId!, { view }),
    enabled: autoLoad && Boolean(petId),
  });

  const pet = (queryResult.data as PetProfileViewMap[TView] | undefined) ?? null;
  const isLoading = queryResult.isLoading || queryResult.isFetching;
  const hasLoaded = queryResult.isFetched;
  const error = queryResult.error instanceof Error ? queryResult.error : null;

  const loadPetProfile = useCallback(async (
    nextPetId: string,
    loadOptions?: { view?: TView },
  ): Promise<PetProfileViewMap[TView]> => {
    const resolvedView = loadOptions?.view ?? viewRef.current;
    petIdRef.current = nextPetId;
    viewRef.current = resolvedView;
    setPetId(nextPetId);
    setView(resolvedView);

    const result = await queryClient.fetchQuery({
      queryKey: petQueryKeys.detail(nextPetId, resolvedView),
      queryFn: () => fetchPetProfileById<TView>(nextPetId, { view: resolvedView }),
    });

    return result as PetProfileViewMap[TView];
  }, [queryClient]);

  const refreshPetProfile = useCallback(async (): Promise<PetProfileViewMap[TView] | null> => {
    if (!petIdRef.current) return null;
    return queryClient.fetchQuery({
      queryKey: petQueryKeys.detail(petIdRef.current, viewRef.current),
      queryFn: () => fetchPetProfileById<TView>(petIdRef.current!, { view: viewRef.current }),
    });
  }, [queryClient]);

  const clearPetProfile = useCallback(() => {
    petIdRef.current = null;
    setPetId(null);
  }, []);

  return {
    pet,
    petId,
    view,
    isLoading,
    hasLoaded,
    error,
    setPetId,
    setView,
    loadPetProfile,
    refreshPetProfile,
    clearPetProfile,
  };
}
