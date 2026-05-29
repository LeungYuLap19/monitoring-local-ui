import type {
  PetDisplaySex,
  PetManagementDetail,
  PetManagementListItem,
  PetProfileCreatePayload,
  PetProfileFull,
  PetProfileListQuery,
  PetProfileMultipartOptions,
  PetProfileSummary,
  PetProfileUpdatePayload,
  PetProfileView,
} from '../../../types/lib/pet';

const PET_PROFILE_UPDATE_STRING_FIELDS = [
  'name',
  'animal',
  'birthday',
  'sex',
  'sterilizationDate',
  'adoptionStatus',
  'breed',
  'bloodType',
  'status',
  'owner',
  'receivedDate',
  'ngoId',
  'ngoPetId',
  'location',
  'position',
] as const;

const PET_PROFILE_UPDATE_NULLABLE_STRING_FIELDS = [
  'features',
  'info',
  'tagId',
  'chipId',
  'placeOfBirth',
  'motherName',
  'motherBreed',
  'motherChip',
  'motherPlaceOfBirth',
  'fatherName',
  'fatherBreed',
  'fatherChip',
  'fatherPlaceOfBirth',
  'monitorCameraId',
] as const;

const PET_PROFILE_UPDATE_BOOLEAN_FIELDS = [
  'sterilization',
  'contact1Show',
  'contact2Show',
] as const;

const PET_PROFILE_UPDATE_NUMBER_FIELDS = ['ownerContact1'] as const;

const PET_PROFILE_UPDATE_NULLABLE_NUMBER_FIELDS = [
  'weight',
  'ownerContact2',
  'motherParity',
] as const;

const PET_PROFILE_UPDATE_NULLABLE_DATE_FIELDS = ['motherDOB', 'fatherDOB'] as const;

function appendStringField(formData: FormData, fieldName: string, value: string): void {
  formData.append(fieldName, value);
}

function appendNumberField(formData: FormData, fieldName: string, value: number): void {
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid numeric value for "${fieldName}"`);
  }
  formData.append(fieldName, String(value));
}

function appendBooleanField(formData: FormData, fieldName: string, value: boolean): void {
  formData.append(fieldName, String(value));
}

function appendFiles(formData: FormData, fieldName: string, files: File[]): void {
  for (const file of files) {
    if (!(typeof Blob !== 'undefined' && file instanceof Blob)) {
      throw new Error(`Invalid file supplied for "${fieldName}"`);
    }

    const filename = 'name' in file && typeof file.name === 'string' && file.name.trim()
      ? file.name
      : 'upload.bin';

    formData.append(fieldName, file, filename);
  }
}

export function toPetProfileListQueryParams(query: PetProfileListQuery = {}): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  if (typeof query.page === 'number') params.page = query.page;
  if (typeof query.limit === 'number') params.limit = query.limit;
  if (query.search?.trim()) params.search = query.search.trim();
  if (query.sortBy) params.sortBy = query.sortBy;
  if (query.sortOrder) params.sortOrder = query.sortOrder;

  return params;
}

export function normalizePetProfileView(view?: PetProfileView): PetProfileView {
  return view ?? 'full';
}

function toNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function toNullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function toContactString(value: unknown): string | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return null;
}

export function normalizePetDisplaySex(value?: string | null): PetDisplaySex {
  if (!value) return null;

  const normalized = value.trim().toLowerCase();

  if (['male', 'm', 'boy', '公', '雄', 'male rabbit'].includes(normalized)) {
    return 'male';
  }

  if (['female', 'f', 'girl', '母', '雌', 'female rabbit'].includes(normalized)) {
    return 'female';
  }

  return null;
}

export function calculatePetAgeYears(birthday?: string | null): number | null {
  if (!birthday) return null;

  const date = new Date(birthday);
  if (Number.isNaN(date.getTime())) return null;

  const now = new Date();
  let years = now.getFullYear() - date.getFullYear();
  const monthDelta = now.getMonth() - date.getMonth();
  const dayDelta = now.getDate() - date.getDate();

  if (monthDelta < 0 || (monthDelta === 0 && dayDelta < 0)) {
    years -= 1;
  }

  return years >= 0 ? years : null;
}

export function formatPetDate(value?: string | null, locale: string = 'en'): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const resolvedLocale = locale === 'zh-TW' ? 'zh-HK' : 'en-US';

  return new Intl.DateTimeFormat(resolvedLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function toPetManagementListItem(pet: PetProfileSummary): PetManagementListItem | null {
  const id = toNullableString(pet._id);
  const name = toNullableString(pet.name);

  if (!id || !name) {
    return null;
  }

  const imageUrls = toStringArray(pet.breedimage);

  return {
    id,
    name,
    breed: toNullableString(pet.breed),
    animal: toNullableString(pet.animal),
    sex: normalizePetDisplaySex(pet.sex),
    birthday: toNullableString(pet.birthday),
    ageYears: calculatePetAgeYears(pet.birthday),
    weight: toNullableNumber(pet.weight),
    sterilization: typeof pet.sterilization === 'boolean' ? pet.sterilization : null,
    adoptionStatus: toNullableString(pet.adoptionStatus),
    status: toNullableString(pet.status),
    receivedDate: toNullableString(pet.receivedDate),
    ngoPetId: toNullableString(pet.ngoPetId),
    location: toNullableString(pet.location),
    position: toNullableString(pet.position),
    imageUrls,
    primaryImageUrl: imageUrls[0] ?? null,
  };
}

export function toPetManagementDetail(pet: PetProfileFull): PetManagementDetail | null {
  const id = toNullableString(pet.id);
  const name = toNullableString(pet.name);

  if (!id || !name) {
    return null;
  }

  const imageUrls = toStringArray(pet.breedimage);

  return {
    id,
    name,
    breed: toNullableString(pet.breed),
    animal: toNullableString(pet.animal),
    sex: normalizePetDisplaySex(pet.sex),
    birthday: toNullableString(pet.birthday),
    ageYears: calculatePetAgeYears(pet.birthday),
    weight: toNullableNumber(pet.weight),
    sterilization: typeof pet.sterilization === 'boolean' ? pet.sterilization : null,
    adoptionStatus: toNullableString(pet.adoptionStatus),
    status: toNullableString(pet.status),
    receivedDate: toNullableString(pet.receivedDate),
    ngoPetId: toNullableString(pet.ngoPetId),
    location: toNullableString(pet.location),
    position: toNullableString(pet.position),
    imageUrls,
    primaryImageUrl: imageUrls[0] ?? null,
    bloodType: toNullableString(pet.bloodType),
    features: toNullableString(pet.features),
    info: toNullableString(pet.info),
    owner: toNullableString(pet.owner),
    ownerContact1: pet.contact1Show ? toContactString(pet.ownerContact1) : null,
    ownerContact2: pet.contact2Show ? toContactString(pet.ownerContact2) : null,
    tagId: toNullableString(pet.tagId),
    isRegistered: typeof pet.isRegistered === 'boolean' ? pet.isRegistered : null,
    createdAt: toNullableString(pet.createdAt),
    updatedAt: toNullableString(pet.updatedAt),
    latestPetLostId: toNullableString(pet.latestPetLostId),
    monitorCameraId: toNullableString(pet.monitorCameraId),
    sterilizationDate: toNullableString(pet.sterilizationDate),
    chipId: toNullableString(pet.chipId),
    placeOfBirth: toNullableString(pet.placeOfBirth),
    motherName: toNullableString(pet.motherName),
    motherBreed: toNullableString(pet.motherBreed),
    motherDOB: toNullableString(pet.motherDOB),
    motherChip: toNullableString(pet.motherChip),
    motherPlaceOfBirth: toNullableString(pet.motherPlaceOfBirth),
    motherParity: toNullableNumber(pet.motherParity),
    fatherName: toNullableString(pet.fatherName),
    fatherBreed: toNullableString(pet.fatherBreed),
    fatherDOB: toNullableString(pet.fatherDOB),
    fatherChip: toNullableString(pet.fatherChip),
    fatherPlaceOfBirth: toNullableString(pet.fatherPlaceOfBirth),
    transferCount: Array.isArray(pet.transfer) ? pet.transfer.length : 0,
    transferNgoCount: Array.isArray(pet.transferNGO) ? pet.transferNGO.length : 0,
  };
}

export function buildPetProfileUpdateFormData(
  payload: PetProfileUpdatePayload,
  options: PetProfileMultipartOptions = {},
): FormData {
  const formData = new FormData();
  const fileFieldName = options.fileFieldName?.trim() || 'file';

  if (payload.removedIndices !== undefined) {
    if (!Array.isArray(payload.removedIndices) || payload.removedIndices.some((index) => !Number.isInteger(index) || index < 0)) {
      throw new Error('removedIndices must be an array of non-negative integers');
    }

    formData.append('removedIndices', JSON.stringify(payload.removedIndices));
  }

  for (const fieldName of PET_PROFILE_UPDATE_STRING_FIELDS) {
    const value = payload[fieldName];
    if (typeof value === 'string') {
      appendStringField(formData, fieldName, value);
    }
  }

  // The patch contract uses empty-string multipart values to clear selected text fields.
  for (const fieldName of PET_PROFILE_UPDATE_NULLABLE_STRING_FIELDS) {
    const value = payload[fieldName];
    if (typeof value === 'string') {
      appendStringField(formData, fieldName, value);
    } else if (value === null) {
      appendStringField(formData, fieldName, '');
    }
  }

  for (const fieldName of PET_PROFILE_UPDATE_BOOLEAN_FIELDS) {
    const value = payload[fieldName];
    if (typeof value === 'boolean') {
      appendBooleanField(formData, fieldName, value);
    }
  }

  for (const fieldName of PET_PROFILE_UPDATE_NUMBER_FIELDS) {
    const value = payload[fieldName];
    if (typeof value === 'number') {
      appendNumberField(formData, fieldName, value);
    }
  }

  for (const fieldName of PET_PROFILE_UPDATE_NULLABLE_NUMBER_FIELDS) {
    const value = payload[fieldName];
    if (typeof value === 'number') {
      appendNumberField(formData, fieldName, value);
    } else if (value === null) {
      appendStringField(formData, fieldName, 'null');
    }
  }

  for (const fieldName of PET_PROFILE_UPDATE_NULLABLE_DATE_FIELDS) {
    const value = payload[fieldName];
    if (typeof value === 'string') {
      appendStringField(formData, fieldName, value);
    } else if (value === null) {
      appendStringField(formData, fieldName, 'null');
    }
  }

  if (payload.imageFiles?.length) {
    appendFiles(formData, fileFieldName, payload.imageFiles);
  }

  return formData;
}

export function buildPetProfileCreateFormData(
  payload: PetProfileCreatePayload,
  options: PetProfileMultipartOptions = {},
): FormData {
  const formData = new FormData();
  const fileFieldName = options.fileFieldName?.trim() || 'file';

  appendStringField(formData, 'name', payload.name);
  appendStringField(formData, 'animal', payload.animal);
  appendStringField(formData, 'sex', payload.sex);
  appendStringField(formData, 'birthday', payload.birthday);

  if (payload.breed) appendStringField(formData, 'breed', payload.breed);
  if (typeof payload.weight === 'number') appendNumberField(formData, 'weight', payload.weight);
  if (typeof payload.sterilization === 'boolean') appendBooleanField(formData, 'sterilization', payload.sterilization);
  if (payload.sterilizationDate) appendStringField(formData, 'sterilizationDate', payload.sterilizationDate);
  if (payload.adoptionStatus) appendStringField(formData, 'adoptionStatus', payload.adoptionStatus);
  if (payload.bloodType) appendStringField(formData, 'bloodType', payload.bloodType);
  if (payload.features) appendStringField(formData, 'features', payload.features);
  if (payload.info) appendStringField(formData, 'info', payload.info);
  if (payload.status) appendStringField(formData, 'status', payload.status);
  if (payload.owner) appendStringField(formData, 'owner', payload.owner);
  if (typeof payload.ownerContact1 === 'number') appendNumberField(formData, 'ownerContact1', payload.ownerContact1);
  if (typeof payload.ownerContact2 === 'number') appendNumberField(formData, 'ownerContact2', payload.ownerContact2);
  if (typeof payload.contact1Show === 'boolean') appendBooleanField(formData, 'contact1Show', payload.contact1Show);
  if (typeof payload.contact2Show === 'boolean') appendBooleanField(formData, 'contact2Show', payload.contact2Show);
  if (payload.receivedDate) appendStringField(formData, 'receivedDate', payload.receivedDate);
  if (payload.location) appendStringField(formData, 'location', payload.location);
  if (payload.position) appendStringField(formData, 'position', payload.position);
  if (payload.tagId) appendStringField(formData, 'tagId', payload.tagId);

  if (payload.imageFiles?.length) {
    appendFiles(formData, fileFieldName, payload.imageFiles);
  }

  return formData;
}
