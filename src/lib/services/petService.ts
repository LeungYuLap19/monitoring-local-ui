import type {
  PetProfileBasic,
  PetProfileCreatePayload,
  PetProfileCreateResult,
  PetProfileDetail,
  PetProfileFull,
  PetProfileListQuery,
  PetProfileMultipartOptions,
  PetProfileMutationResult,
  PetProfileSummary,
  PetProfileUpdatePayload,
  PetProfileView,
  PetProfileViewMap,
  UserPetListResult,
} from '../../types/lib/pet';
import {
  buildPetProfileCreateFormData,
  buildPetProfileUpdateFormData,
  normalizePetProfileView,
  toPetProfileListQueryParams,
} from '../utils/services/pet-service';
import {
  requestProtectedApi,
  requestProtectedApiResult,
  requestProtectedApiWithMeta,
} from './authService';

export async function fetchUserPets(query: PetProfileListQuery = {}): Promise<UserPetListResult> {
  const response = await requestProtectedApiWithMeta<PetProfileSummary[]>({
    method: 'GET',
    url: '/pet/profile/me',
    params: toPetProfileListQueryParams(query),
  });

  return {
    pets: Array.isArray(response.data) ? response.data : [],
    pagination: response.pagination,
    message: response.message,
    requestId: response.requestId,
  };
}

export async function fetchPetProfileById(petId: string, options: { view: 'basic' }): Promise<PetProfileBasic>;
export async function fetchPetProfileById(petId: string, options: { view: 'detail' }): Promise<PetProfileDetail>;
export async function fetchPetProfileById(petId: string, options?: { view?: 'full' }): Promise<PetProfileFull>;
export async function fetchPetProfileById<TView extends PetProfileView>(
  petId: string,
  options?: { view?: TView },
): Promise<PetProfileViewMap[TView]>;
export async function fetchPetProfileById<TView extends PetProfileView>(
  petId: string,
  options?: { view?: TView },
): Promise<PetProfileViewMap[TView]> {
  const view = normalizePetProfileView(options?.view) as TView;

  return requestProtectedApi<PetProfileViewMap[TView]>({
    method: 'GET',
    url: `/pet/profile/${encodeURIComponent(petId)}`,
    params: { view },
  });
}

export async function updatePetProfileById(
  petId: string,
  payload: PetProfileUpdatePayload,
  options: PetProfileMultipartOptions = {},
): Promise<PetProfileMutationResult> {
  const normalizedPetId = petId.trim();
  if (!normalizedPetId) {
    throw new Error('Pet id is required to update a pet profile');
  }

  const formData = buildPetProfileUpdateFormData(payload, options);
  const response = await requestProtectedApiResult<undefined>({
    method: 'PATCH',
    url: `/pet/profile/${encodeURIComponent(normalizedPetId)}`,
    data: formData,
  });

  return {
    message: response.message,
    requestId: response.requestId,
  };
}

export async function createPetProfile(
  payload: PetProfileCreatePayload,
  options: PetProfileMultipartOptions = {},
): Promise<PetProfileCreateResult> {
  const formData = buildPetProfileCreateFormData(payload, options);
  const response = await requestProtectedApiResult<{ id: string }>({
    method: 'POST',
    url: '/pet/profile',
    data: formData,
  });

  return {
    id: response.data.id,
    message: response.message,
    requestId: response.requestId,
  };
}
