import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

export function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

export function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isSuccessStatus(status: number): boolean {
  return status >= 200 && status < 300;
}

export function readErrorMessage(payload: unknown, fallback: string): string {
  if (isObjectRecord(payload)) {
    return asString(payload.error) ?? asString(payload.message) ?? fallback;
  }

  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  return fallback;
}

export function createJsonHttpClient(options: {
  baseURL: string;
  timeout: number;
  withCredentials?: boolean;
  headers?: Record<string, string>;
  validateStatus?: ((status: number) => boolean) | null;
}): AxiosInstance {
  return axios.create({
    baseURL: options.baseURL,
    timeout: options.timeout,
    withCredentials: options.withCredentials,
    headers: options.headers,
    validateStatus: options.validateStatus ?? undefined,
  });
}

export function isFormDataPayload(value: unknown): value is FormData {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

export function clearContentTypeHeader(config: InternalAxiosRequestConfig): void {
  if (!config.headers) return;

  const headers = config.headers as InternalAxiosRequestConfig['headers'] & {
    delete?: (name: string) => void;
  } & Record<string, unknown>;

  headers.delete?.('Content-Type');
  headers.delete?.('content-type');
  delete headers['Content-Type'];
  delete headers['content-type'];
}
