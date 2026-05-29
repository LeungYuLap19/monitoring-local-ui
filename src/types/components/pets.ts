import type {
  PetManagementDetail,
  PetManagementDetailTab,
  PetManagementListItem,
  PetProfileListSortBy,
  PetProfileSortOrder,
} from '../lib/pet';
import type { ApiPagination } from '../lib/api';

export interface PetFormState {
  formId: string;
  formName: string;
  formAnimal: string;
  formBreed: string;
  formSex: string;
  formWeight: number;
  formBirthday: string;
  formSterilization: boolean;
  formSterilizationDate: string;
  formAdoptionStatus: string;
  formBloodType: string;
}

export interface PetFormModalProps {
  mode: 'add' | 'edit';
  formState: PetFormState;
  imageFiles?: File[];
  isSubmitting?: boolean;
  onFieldChange: (field: keyof PetFormState, value: string | number | boolean) => void;
  onImageFilesChange?: (files: File[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export interface PetSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: PetProfileListSortBy;
  sortOrder: PetProfileSortOrder;
  onSortByChange: (value: PetProfileListSortBy) => void;
  onSortOrderChange: (value: PetProfileSortOrder) => void;
  viewMode: 'grid' | 'list';
  onSetViewMode: (mode: 'grid' | 'list') => void;
}

export interface PetCardGridProps {
  pets: PetManagementListItem[];
  onSelectPet: (petId: string) => void;
}

export interface PetListViewProps {
  pets: PetManagementListItem[];
  onSelectPet: (petId: string) => void;
}

export interface PetDetailViewProps {
  pet: PetManagementDetail;
  activeDetailTab: PetManagementDetailTab;
  onSetActiveDetailTab: (tab: PetManagementDetailTab) => void;
  onBack: () => void;
  onEdit?: () => void;
  availableCameras?: { id: string; name: string; isOnline: boolean }[];
  onUpdateMonitorCamera?: (cameraId: string | null) => void;
  isUpdatingCamera?: boolean;
  monitorBackendConnected?: boolean;
  onNavigateToMonitoring?: () => void;
}

export interface PetPaginationProps {
  pagination: ApiPagination | null;
  isLoading?: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onPageSelect: (page: number) => void;
}
