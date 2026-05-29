import type { ApiPagination } from './api';

export type PetProfileView = 'basic' | 'detail' | 'full';
export type PetProfileSortOrder = 'asc' | 'desc';
export type PetProfileListSortBy =
  | 'updatedAt'
  | 'createdAt'
  | 'name'
  | 'animal'
  | 'breed'
  | 'birthday'
  | 'receivedDate'
  | 'ngoPetId';

export interface PetProfileListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: PetProfileListSortBy;
  sortOrder?: PetProfileSortOrder;
}

export interface PetProfileSummary {
  _id?: string;
  name?: string;
  breedimage?: string[];
  animal?: string;
  birthday?: string;
  weight?: number;
  sex?: string;
  sterilization?: boolean;
  adoptionStatus?: string;
  breed?: string;
  status?: string;
  receivedDate?: string;
  ngoPetId?: string;
  createdAt?: string;
  updatedAt?: string;
  location?: string;
  position?: string;
  monitorCameraId?: string | null;
}

export interface PetProfileBasic {
  id?: string;
  userId?: string;
  name?: string;
  breedimage?: string[];
  animal?: string;
  birthday?: string;
  weight?: number | null;
  sex?: string;
  sterilization?: boolean;
  sterilizationDate?: string;
  adoptionStatus?: string;
  breed?: string;
  bloodType?: string;
  features?: string;
  info?: string;
  status?: string;
  owner?: string;
  ngoId?: string;
  ownerContact1?: number;
  ownerContact2?: number | null;
  contact1Show?: boolean;
  contact2Show?: boolean;
  tagId?: string | null;
  isRegistered?: boolean;
  receivedDate?: string;
  ngoPetId?: string;
  createdAt?: string;
  updatedAt?: string;
  location?: string;
  position?: string;
  monitorCameraId?: string | null;
  latestPetLostId?: string | null;
}

export interface PetTransferRecord {
  [key: string]: unknown;
}

export interface PetProfileDetail {
  id?: string;
  chipId?: string;
  placeOfBirth?: string;
  motherName?: string;
  motherBreed?: string;
  motherDOB?: string | null;
  motherChip?: string;
  motherPlaceOfBirth?: string;
  motherParity?: number | null;
  fatherName?: string;
  fatherBreed?: string;
  fatherDOB?: string | null;
  fatherChip?: string;
  fatherPlaceOfBirth?: string;
  transfer?: PetTransferRecord[];
  transferNGO?: PetTransferRecord[];
}

export type PetProfileFull = PetProfileBasic & PetProfileDetail;

export interface PetProfileViewMap {
  basic: PetProfileBasic;
  detail: PetProfileDetail;
  full: PetProfileFull;
}

export type PetDisplaySex = 'male' | 'female' | null;
export type PetManagementDetailTab = 'info' | 'photos' | 'lineage' | 'monitoring';

export interface PetManagementListItem {
  id: string;
  name: string;
  breed: string | null;
  animal: string | null;
  sex: PetDisplaySex;
  birthday: string | null;
  ageYears: number | null;
  weight: number | null;
  sterilization: boolean | null;
  adoptionStatus: string | null;
  status: string | null;
  receivedDate: string | null;
  ngoPetId: string | null;
  location: string | null;
  position: string | null;
  imageUrls: string[];
  primaryImageUrl: string | null;
}

export interface PetManagementDetail extends PetManagementListItem {
  bloodType: string | null;
  features: string | null;
  info: string | null;
  owner: string | null;
  ownerContact1: string | null;
  ownerContact2: string | null;
  tagId: string | null;
  isRegistered: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
  latestPetLostId: string | null;
  monitorCameraId: string | null;
  sterilizationDate: string | null;
  chipId: string | null;
  placeOfBirth: string | null;
  motherName: string | null;
  motherBreed: string | null;
  motherDOB: string | null;
  motherChip: string | null;
  motherPlaceOfBirth: string | null;
  motherParity: number | null;
  fatherName: string | null;
  fatherBreed: string | null;
  fatherDOB: string | null;
  fatherChip: string | null;
  fatherPlaceOfBirth: string | null;
  transferCount: number;
  transferNgoCount: number;
}

export interface PetProfileMutationResult {
  message?: string;
  requestId?: string;
}

export interface PetProfileMultipartOptions {
  fileFieldName?: string;
}

export interface PetProfileUpdatePayload {
  removedIndices?: number[];
  name?: string;
  animal?: string;
  birthday?: string;
  weight?: number | null;
  sex?: string;
  sterilization?: boolean;
  sterilizationDate?: string;
  adoptionStatus?: string;
  breed?: string;
  bloodType?: string;
  features?: string | null;
  info?: string | null;
  status?: string;
  owner?: string;
  tagId?: string | null;
  ownerContact1?: number;
  ownerContact2?: number | null;
  contact1Show?: boolean;
  contact2Show?: boolean;
  receivedDate?: string;
  ngoId?: string;
  ngoPetId?: string;
  location?: string;
  position?: string;
  chipId?: string | null;
  placeOfBirth?: string | null;
  motherName?: string | null;
  motherBreed?: string | null;
  motherDOB?: string | null;
  motherChip?: string | null;
  motherPlaceOfBirth?: string | null;
  motherParity?: number | null;
  fatherName?: string | null;
  fatherBreed?: string | null;
  fatherDOB?: string | null;
  fatherChip?: string | null;
  fatherPlaceOfBirth?: string | null;
  monitorCameraId?: string | null;
  imageFiles?: File[];
}

export interface PetProfileCreatePayload {
  name: string;
  animal: string;
  sex: string;
  birthday: string;
  breed?: string;
  weight?: number;
  sterilization?: boolean;
  sterilizationDate?: string;
  adoptionStatus?: string;
  bloodType?: string;
  features?: string;
  info?: string;
  status?: string;
  owner?: string;
  ownerContact1?: number;
  ownerContact2?: number;
  contact1Show?: boolean;
  contact2Show?: boolean;
  receivedDate?: string;
  location?: string;
  position?: string;
  tagId?: string;
  imageFiles?: File[];
}

export interface PetProfileCreateResult {
  id: string;
  message?: string;
  requestId?: string;
}

export interface UserPetListResult {
  pets: PetProfileSummary[];
  pagination: ApiPagination | null;
  message?: string;
  requestId?: string;
}
