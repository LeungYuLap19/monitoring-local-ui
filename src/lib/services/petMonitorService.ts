import type { AxiosRequestConfig } from 'axios';
import type {
  PetMonitorActiveCamerasResponse,
  PetMonitorCameraConfigUpdateResponse,
  PetMonitorCameraIndex,
  PetMonitorCameraRuntimeConfig,
  PetMonitorCameraRuntimeConfigUpdate,
  PetMonitorDeleteVideoRecordResponse,
  PetMonitorVideoRecordsQuery,
  PetMonitorVideoRecordsResponse,
} from '../../types/lib/monitoring';
import {
  isObjectRecord,
  isSuccessStatus,
  readErrorMessage,
} from '../utils/http/http';
import {
  buildPetMonitorRecordThumbnailUrl,
  buildPetMonitorRecordVideoUrl,
  buildPetMonitorUrl as buildPetMonitorUrlWithBase,
  buildPetMonitorVideoFeedUrl,
  createPetMonitorClient,
  normalizePetMonitorApiBaseUrl,
  requestPetMonitor as requestPetMonitorWithClient,
  requirePetMonitorSuccess as requireSuccessStatus,
} from '../utils/services/pet-monitor-service';

export { PetMonitorServiceError } from '../utils/services/pet-monitor-service';

export const PET_MONITOR_API_BASE_URL = (
  normalizePetMonitorApiBaseUrl(import.meta.env.VITE_MONITOR_API_BASE_URL)
);

const petMonitorClient = createPetMonitorClient(PET_MONITOR_API_BASE_URL);

function requestPetMonitor<T>(config: AxiosRequestConfig) {
  return requestPetMonitorWithClient<T>(petMonitorClient, config);
}

export function buildPetMonitorUrl(path: string): string {
  return buildPetMonitorUrlWithBase(PET_MONITOR_API_BASE_URL, path);
}

export function getPetMonitorBehaviorSSEUrl(): string {
  return buildPetMonitorUrlWithBase(PET_MONITOR_API_BASE_URL, '/api/stream/behavior');
}

export function getPetMonitorVideoFeedUrl(camId: PetMonitorCameraIndex): string {
  return buildPetMonitorVideoFeedUrl(PET_MONITOR_API_BASE_URL, camId);
}

export function getPetMonitorRecordVideoUrl(filename: string): string {
  return buildPetMonitorRecordVideoUrl(PET_MONITOR_API_BASE_URL, filename);
}

export function getPetMonitorRecordThumbnailUrl(filename: string): string {
  return buildPetMonitorRecordThumbnailUrl(PET_MONITOR_API_BASE_URL, filename);
}

export async function getPetMonitorActiveCameras(): Promise<PetMonitorCameraIndex[]> {
  const response = await requestPetMonitor<PetMonitorActiveCamerasResponse>({
    method: 'GET',
    url: '/api/active_cams',
  });

  const data = requireSuccessStatus(response, 'Failed to fetch active PetMonitor cameras');
  return Array.isArray(data.active_cams) ? data.active_cams : [];
}

export async function setPetMonitorActiveCameras(
  activeCams: PetMonitorCameraIndex[],
): Promise<PetMonitorActiveCamerasResponse> {
  const response = await requestPetMonitor<PetMonitorActiveCamerasResponse>({
    method: 'POST',
    url: '/api/active_cams',
    data: { active_cams: activeCams },
  });

  const data = (response.data ?? {}) as PetMonitorActiveCamerasResponse;
  return {
    active_cams: Array.isArray(data.active_cams) ? data.active_cams : activeCams,
    success: isSuccessStatus(response.status) && data.success !== false,
  };
}

export async function getPetMonitorCameraConfig(
  camId: PetMonitorCameraIndex,
): Promise<PetMonitorCameraRuntimeConfig> {
  const response = await requestPetMonitor<PetMonitorCameraRuntimeConfig>({
    method: 'GET',
    url: `/api/config/${camId}`,
  });

  return requireSuccessStatus(response, `Failed to fetch PetMonitor config for camera ${camId}`);
}

export async function updatePetMonitorCameraConfig(
  camId: PetMonitorCameraIndex,
  config: PetMonitorCameraRuntimeConfigUpdate,
): Promise<PetMonitorCameraConfigUpdateResponse> {
  const response = await requestPetMonitor<PetMonitorCameraConfigUpdateResponse>({
    method: 'POST',
    url: `/api/config/${camId}`,
    data: config,
  });

  const data = (response.data ?? {}) as PetMonitorCameraConfigUpdateResponse;
  return {
    ...data,
    success: isSuccessStatus(response.status) && data.success !== false,
    error: data.error ?? (!isSuccessStatus(response.status)
      ? readErrorMessage(data, `Failed to update PetMonitor config for camera ${camId}`)
      : undefined),
  };
}

export async function getPetMonitorVideoRecords(
  query: PetMonitorVideoRecordsQuery = {},
): Promise<PetMonitorVideoRecordsResponse> {
  const response = await requestPetMonitor<PetMonitorVideoRecordsResponse>({
    method: 'GET',
    url: '/api/records',
    params: query,
  });

  const data = (response.data ?? {}) as PetMonitorVideoRecordsResponse;
  return {
    success: isSuccessStatus(response.status) && data.success !== false,
    records: Array.isArray(data.records) ? data.records : [],
    error: data.error ?? (!isSuccessStatus(response.status)
      ? readErrorMessage(data, 'Failed to fetch PetMonitor video records')
      : undefined),
  };
}

export async function deletePetMonitorVideoRecord(
  recordId: number,
): Promise<PetMonitorDeleteVideoRecordResponse> {
  const response = await requestPetMonitor<PetMonitorDeleteVideoRecordResponse>({
    method: 'DELETE',
    url: `/api/records/${recordId}`,
  });

  const data = (response.data ?? {}) as PetMonitorDeleteVideoRecordResponse;
  return {
    success: isSuccessStatus(response.status) && data.success !== false,
    error: data.error ?? (!isSuccessStatus(response.status)
      ? readErrorMessage(data, `Failed to delete PetMonitor video record ${recordId}`)
      : undefined),
  };
}

export interface MonitoringSyncResponse {
  success: boolean;
  applied_profile?: string;
  changed_cameras?: number[];
  error?: string;
}

export async function syncMonitoringModels(
  selectedAiModelKeys: string[],
  limits?: { cameraLimit?: number; aiModelSelectionLimit?: number },
): Promise<MonitoringSyncResponse> {
  const response = await requestPetMonitor<MonitoringSyncResponse>({
    method: 'POST',
    url: '/api/monitoring/sync',
    data: { selectedAiModelKeys, ...limits },
  });

  const data = (response.data ?? {}) as MonitoringSyncResponse;
  return {
    success: isSuccessStatus(response.status) && data.success !== false,
    applied_profile: data.applied_profile,
    changed_cameras: data.changed_cameras,
    error: data.error,
  };
}

export interface MonitoringSettingsLocal {
  success: boolean;
  cameras: Record<string, { animal_profile: string; name: string }>;
}

export async function getMonitoringSettingsLocal(): Promise<MonitoringSettingsLocal> {
  const response = await requestPetMonitor<MonitoringSettingsLocal>({
    method: 'GET',
    url: '/api/monitoring/settings',
  });

  const data = (response.data ?? {}) as MonitoringSettingsLocal;
  return {
    success: isSuccessStatus(response.status) && data.success !== false,
    cameras: isObjectRecord(data.cameras) ? data.cameras as Record<string, { animal_profile: string; name: string }> : {},
  };
}
