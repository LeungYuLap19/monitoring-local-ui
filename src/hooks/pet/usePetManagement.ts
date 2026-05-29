import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  PetManagementListItem,
  PetProfileFull,
  PetProfileListSortBy,
  PetProfileSortOrder,
  UsePetManagementResult,
} from '../../types';
import { toPetManagementDetail, toPetManagementListItem } from '../../lib/utils/services/pet-service';
import { usePetProfile } from './usePetProfile';
import { useUserPets } from './useUserPets';

const PETS_PAGE_SIZE = 12;
const DEFAULT_SORT_BY: PetProfileListSortBy = 'updatedAt';
const DEFAULT_SORT_ORDER: PetProfileSortOrder = 'desc';

export function usePetManagement(): UsePetManagementResult {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<PetProfileListSortBy>(DEFAULT_SORT_BY);
  const [sortOrder, setSortOrder] = useState<PetProfileSortOrder>(DEFAULT_SORT_ORDER);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeDetailTab, setActiveDetailTab] = useState<'info' | 'photos' | 'lineage'>('info');

  const {
    pets: userPets,
    pagination,
    query,
    isLoading: isPetsLoading,
    hasLoaded: hasLoadedPets,
    error: petsError,
    loadPets,
    refreshPets,
  } = useUserPets({
    autoLoad: false,
    initialQuery: {
      page: 1,
      limit: PETS_PAGE_SIZE,
      sortBy: DEFAULT_SORT_BY,
      sortOrder: DEFAULT_SORT_ORDER,
    },
  });
  const {
    pet: petProfile,
    petId: selectedPetId,
    isLoading: isPetLoading,
    hasLoaded: hasLoadedPet,
    error: petError,
    loadPetProfile,
    refreshPetProfile,
    clearPetProfile,
  } = usePetProfile<'full'>({
    autoLoad: false,
    initialView: 'full',
  });

  useEffect(() => {
    const normalizedSearch = searchTerm.trim();

    const timer = window.setTimeout(() => {
      void loadPets({
        page: 1,
        limit: PETS_PAGE_SIZE,
        search: normalizedSearch || undefined,
        sortBy,
        sortOrder,
      });
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadPets, searchTerm, sortBy, sortOrder]);

  const pets = useMemo(
    () => userPets
      .map(toPetManagementListItem)
      .filter((pet): pet is PetManagementListItem => pet !== null),
    [userPets],
  );

  const selectedPet = useMemo(
    () => (petProfile ? toPetManagementDetail(petProfile) : null),
    [petProfile],
  );

  const openPetDetails = useCallback<UsePetManagementResult['openPetDetails']>(async (petId) => {
    setActiveDetailTab('info');
    await loadPetProfile(petId, { view: 'full' });
  }, [loadPetProfile]);

  const closePetDetails = useCallback(() => {
    setActiveDetailTab('info');
    clearPetProfile();
  }, [clearPetProfile]);

  const goToPage = useCallback<UsePetManagementResult['goToPage']>(async (page) => {
    const safePage = Number.isFinite(page) ? Math.max(1, Math.trunc(page)) : 1;
    return loadPets({
      page: safePage,
      limit: query.limit ?? PETS_PAGE_SIZE,
      search: searchTerm.trim() || undefined,
      sortBy,
      sortOrder,
    });
  }, [loadPets, query.limit, searchTerm, sortBy, sortOrder]);

  const goToNextPage = useCallback<UsePetManagementResult['goToNextPage']>(async () => {
    if (!pagination || pagination.page >= pagination.totalPages) {
      return null;
    }

    return goToPage(pagination.page + 1);
  }, [goToPage, pagination]);

  const goToPreviousPage = useCallback<UsePetManagementResult['goToPreviousPage']>(async () => {
    if (!pagination || pagination.page <= 1) {
      return null;
    }

    return goToPage(pagination.page - 1);
  }, [goToPage, pagination]);

  const refreshSelectedPet = useCallback<UsePetManagementResult['refreshSelectedPet']>(async () => {
    const refreshedPet = await refreshPetProfile();
    return refreshedPet as PetProfileFull | null;
  }, [refreshPetProfile]);

  return {
    pets,
    selectedPet,
    selectedPetId,
    pagination,
    searchTerm,
    sortBy,
    sortOrder,
    viewMode,
    activeDetailTab,
    isPetsLoading,
    hasLoadedPets,
    petsError,
    isPetLoading,
    hasLoadedPet,
    petError,
    setSearchTerm,
    setSortBy,
    setSortOrder,
    setViewMode,
    setActiveDetailTab,
    openPetDetails,
    closePetDetails,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    refreshPets,
    refreshSelectedPet,
  };
}
