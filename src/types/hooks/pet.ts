import type { Dispatch, SetStateAction } from 'react';
import type { PetManagementDetail, PetManagementDetailTab, PetManagementListItem } from '../lib/pet';
import type { ApiPagination } from '../lib/api';
import type {
  PetProfileListQuery,
  PetProfileListSortBy,
  PetProfileFull,
  PetProfileCreatePayload,
  PetProfileCreateResult,
  PetProfileMultipartOptions,
  PetProfileMutationResult,
  PetProfileSummary,
  PetProfileSortOrder,
  PetProfileUpdatePayload,
  PetProfileView,
  PetProfileViewMap,
  UserPetListResult,
} from '../lib/pet';

export interface UseUserPetsOptions {
  initialQuery?: PetProfileListQuery;
  autoLoad?: boolean;
}

export interface UseUserPetsResult {
  pets: PetProfileSummary[];
  pagination: ApiPagination | null;
  query: PetProfileListQuery;
  isLoading: boolean;
  hasLoaded: boolean;
  error: Error | null;
  setQuery: Dispatch<SetStateAction<PetProfileListQuery>>;
  loadPets: (nextQuery?: PetProfileListQuery) => Promise<UserPetListResult>;
  refreshPets: () => Promise<UserPetListResult>;
  resetPets: () => void;
}

export interface UsePetProfileOptions<TView extends PetProfileView = 'full'> {
  initialPetId?: string | null;
  initialView?: TView;
  autoLoad?: boolean;
}

export interface UsePetProfileResult<TView extends PetProfileView = 'full'> {
  pet: PetProfileViewMap[TView] | null;
  petId: string | null;
  view: TView;
  isLoading: boolean;
  hasLoaded: boolean;
  error: Error | null;
  setPetId: Dispatch<SetStateAction<string | null>>;
  setView: Dispatch<SetStateAction<TView>>;
  loadPetProfile: (petId: string, options?: { view?: TView }) => Promise<PetProfileViewMap[TView]>;
  refreshPetProfile: () => Promise<PetProfileViewMap[TView] | null>;
  clearPetProfile: () => void;
}

export interface UseUpdatePetProfileOptions {
  initialPetId?: string | null;
}

export interface UseUpdatePetProfileRequestOptions extends PetProfileMultipartOptions {
  petId?: string;
}

export interface UseUpdatePetProfileResult {
  petId: string | null;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  error: Error | null;
  message: string | null;
  requestId: string | null;
  setPetId: Dispatch<SetStateAction<string | null>>;
  updatePetProfile: (
    payload: PetProfileUpdatePayload,
    options?: UseUpdatePetProfileRequestOptions,
  ) => Promise<PetProfileMutationResult>;
  resetUpdateState: () => void;
}

export interface UsePetManagementResult {
  pets: PetManagementListItem[];
  selectedPet: PetManagementDetail | null;
  selectedPetId: string | null;
  pagination: ApiPagination | null;
  searchTerm: string;
  sortBy: PetProfileListSortBy;
  sortOrder: PetProfileSortOrder;
  viewMode: 'grid' | 'list';
  activeDetailTab: PetManagementDetailTab;
  isPetsLoading: boolean;
  hasLoadedPets: boolean;
  petsError: Error | null;
  isPetLoading: boolean;
  hasLoadedPet: boolean;
  petError: Error | null;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  setSortBy: Dispatch<SetStateAction<PetProfileListSortBy>>;
  setSortOrder: Dispatch<SetStateAction<PetProfileSortOrder>>;
  setViewMode: Dispatch<SetStateAction<'grid' | 'list'>>;
  setActiveDetailTab: Dispatch<SetStateAction<PetManagementDetailTab>>;
  openPetDetails: (petId: string) => Promise<void>;
  closePetDetails: () => void;
  goToPage: (page: number) => Promise<UserPetListResult>;
  goToNextPage: () => Promise<UserPetListResult | null>;
  goToPreviousPage: () => Promise<UserPetListResult | null>;
  refreshPets: () => Promise<UserPetListResult>;
  refreshSelectedPet: () => Promise<PetProfileFull | null>;
}

export interface UseCreatePetProfileResult {
  isSubmitting: boolean;
  hasSubmitted: boolean;
  error: Error | null;
  message: string | null;
  createPet: (
    payload: PetProfileCreatePayload,
    options?: PetProfileMultipartOptions,
  ) => Promise<PetProfileCreateResult>;
  resetCreateState: () => void;
}
