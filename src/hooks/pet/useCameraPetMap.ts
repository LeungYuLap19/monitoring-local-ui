import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { PetProfileSummary } from '../../types/lib/pet';
import { fetchUserPets } from '../../lib/services/petService';
import { petQueryKeys } from './petQueryKeys';

export interface CameraPetInfo {
  petId: string;
  name: string;
  breed: string | null;
  animal: string | null;
  status: string | null;
  imageUrl: string | null;
}

export type CameraPetMap = Record<string, CameraPetInfo>;

export function useCameraPetMap() {
  const queryClient = useQueryClient();
  const queryResult = useQuery({
    queryKey: petQueryKeys.cameraMap(),
    queryFn: async () => {
      const result = await fetchUserPets({ limit: 100 });
      return result.pets;
    },
  });
  const pets = queryResult.data ?? [];
  const hasLoaded = queryResult.isFetched;

  const cameraPetMap = useMemo<CameraPetMap>(() => {
    const map: CameraPetMap = {};
    for (const pet of pets) {
      if (pet.monitorCameraId && pet._id) {
        map[pet.monitorCameraId] = {
          petId: pet._id,
          name: pet.name || '',
          breed: pet.breed || null,
          animal: pet.animal || null,
          status: pet.status || null,
          imageUrl: pet.breedimage?.[0] ?? null,
        };
      }
    }
    return map;
  }, [pets]);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: petQueryKeys.cameraMap() });
    return queryClient.fetchQuery({
      queryKey: petQueryKeys.cameraMap(),
      queryFn: async () => {
        const result = await fetchUserPets({ limit: 100 });
        return result.pets;
      },
    });
  }, [queryClient]);

  return { cameraPetMap, hasLoaded, refresh };
}
