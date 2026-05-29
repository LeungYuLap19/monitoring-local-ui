import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import type { PetMonitorCameraIndex } from '../../../types/lib/monitoring';
import {
  createJsonHttpClient,
  isSuccessStatus,
  readErrorMessage,
} from '../http/http';

export const DEFAULT_PET_MONITOR_API_BASE_URL = 'http://127.0.0.1:9527';

export function normalizePetMonitorApiBaseUrl(baseURL?: string): string {
  return (baseURL ?? DEFAULT_PET_MONITOR_API_BASE_URL).replace(/\/+$/, '');
}

export class PetMonitorServiceError extends Error {
  status: number;
  details?: unknown;

  constructor(options: { message: string; status?: number; details?: unknown }) {
    super(options.message);
    this.name = 'PetMonitorServiceError';
    this.status = options.status ?? 0;
    this.details = options.details;
  }
}

export function toPetMonitorServiceError(
  error: unknown,
  fallbackMessage = 'PetMonitor request failed',
): PetMonitorServiceError {
  if (error instanceof PetMonitorServiceError) {
    return error;
  }

  if (!axios.isAxiosError(error)) {
    return new PetMonitorServiceError({
      message: error instanceof Error ? error.message : fallbackMessage,
      details: error,
    });
  }

  const axiosError = error as AxiosError<unknown>;
  return new PetMonitorServiceError({
    message: readErrorMessage(axiosError.response?.data, axiosError.message || fallbackMessage),
    status: axiosError.response?.status ?? 0,
    details: axiosError.response?.data ?? axiosError.toJSON(),
  });
}

export function createPetMonitorClient(baseURL: string): AxiosInstance {
  return createJsonHttpClient({
    baseURL,
    timeout: 20000,
    headers: {
      'Content-Type': 'application/json',
    },
    validateStatus: () => true,
  });
}

export async function requestPetMonitor<T>(
  client: AxiosInstance,
  config: AxiosRequestConfig,
): Promise<AxiosResponse<T>> {
  try {
    return await client.request<T>(config);
  } catch (error) {
    throw toPetMonitorServiceError(error);
  }
}

export function requirePetMonitorSuccess<T>(
  response: AxiosResponse<T>,
  fallbackMessage: string,
): T {
  if (!isSuccessStatus(response.status)) {
    throw new PetMonitorServiceError({
      message: readErrorMessage(response.data, fallbackMessage),
      status: response.status,
      details: response.data,
    });
  }

  return response.data;
}


function encodePathSegments(path: string): string {
  return path
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function normalizeRecordRelativePath(filename: string): string {
  return filename
    .replace(/^records[\\/]/, '')
    .replace(/\\/g, '/')
    .replace(/^\/+/, '');
}

export function buildPetMonitorUrl(baseURL: string, path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseURL}${normalizedPath}`;
}

export function buildPetMonitorVideoFeedUrl(
  baseURL: string,
  camId: PetMonitorCameraIndex,
): string {
  return buildPetMonitorUrl(baseURL, `/video_feed/${camId}`);
}

export function buildPetMonitorRecordVideoUrl(baseURL: string, filename: string): string {
  const cleanName = encodePathSegments(normalizeRecordRelativePath(filename));
  return buildPetMonitorUrl(baseURL, `/records/${cleanName}`);
}

export function buildPetMonitorRecordThumbnailUrl(baseURL: string, filename: string): string {
  const cleanName = normalizeRecordRelativePath(filename)
    .replace('/videos/', '/thumbnails/')
    .replace('.webm', '.jpg')
    .replace('.mp4', '.jpg');

  return buildPetMonitorUrl(baseURL, `/records/${encodePathSegments(cleanName)}`);
}
