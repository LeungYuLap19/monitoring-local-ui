import type { PetProfileListQuery, PetProfileView } from '../../types/lib/pet';

export const petQueryKeys = {
  all: ['pets'] as const,
  lists: () => [...petQueryKeys.all, 'list'] as const,
  list: (query: PetProfileListQuery) => [...petQueryKeys.lists(), query] as const,
  details: () => [...petQueryKeys.all, 'detail'] as const,
  detail: (petId: string, view: PetProfileView) => [...petQueryKeys.details(), petId, view] as const,
  cameraMap: () => [...petQueryKeys.all, 'camera-map'] as const,
};
