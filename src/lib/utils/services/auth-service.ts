import axios, { AxiosError, type AxiosInstance } from 'axios';
import type { ApiErrorEnvelope, ApiSuccessEnvelope } from '../../../types/lib/api';
import { AuthApiError, isAuthApiError, mapStatusToErrorKey } from '../auth';
import { asString, isObjectRecord, createJsonHttpClient, readErrorMessage } from '../http/http';

export function getAuthApiHeaders(apiKey?: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...(apiKey ? { 'x-api-key': apiKey } : {}),
  };
}

export function createAuthApiClient(
  baseURL: string,
  apiKey: string | undefined,
  withCredentials: boolean,
): AxiosInstance {
  return createJsonHttpClient({
    baseURL,
    timeout: 15000,
    withCredentials,
    headers: getAuthApiHeaders(apiKey),
  });
}

export function toAuthApiError(error: unknown): AuthApiError {
  if (isAuthApiError(error)) return error;

  if (!axios.isAxiosError(error)) {
    return new AuthApiError({
      status: 0,
      message: error instanceof Error ? error.message : 'Network error',
      errorKey: 'network.error',
      details: error,
    });
  }

  const axiosError = error as AxiosError<unknown>;
  const status = axiosError.response?.status ?? 0;
  const responseData = axiosError.response?.data;

  let message = readErrorMessage(responseData, axiosError.message || 'Request failed');
  let errorKey = status ? mapStatusToErrorKey(status, message) : 'network.error';
  let requestId: string | undefined;

  if (isObjectRecord(responseData)) {
    const responseMessage = readErrorMessage(responseData, message);
    const envelopeKey = asString(responseData.errorKey);
    requestId = asString(responseData.requestId);
    message = responseMessage;
    errorKey = envelopeKey ?? mapStatusToErrorKey(status, responseMessage) ?? errorKey;
  }

  return new AuthApiError({
    status,
    message,
    errorKey,
    requestId,
    details: responseData ?? axiosError.toJSON(),
  });
}

export async function unwrapAuthEnvelope<TData>(
  promise: Promise<{ data: ApiSuccessEnvelope<TData> | ApiErrorEnvelope }>,
): Promise<ApiSuccessEnvelope<TData>> {
  try {
    const response = await promise;
    const payload = response.data;
    if (isObjectRecord(payload) && payload.success === false) {
      throw new AuthApiError({
        status: 400,
        message: readErrorMessage(payload, 'Request failed'),
        errorKey: asString(payload.errorKey),
        requestId: asString(payload.requestId),
        details: payload,
      });
    }
    return payload as ApiSuccessEnvelope<TData>;
  } catch (error) {
    throw toAuthApiError(error);
  }
}

export async function unwrapAuthData<TData>(
  promise: Promise<{ data: ApiSuccessEnvelope<TData> | ApiErrorEnvelope }>,
): Promise<TData> {
  const payload = await unwrapAuthEnvelope(promise);
  return (payload.data ?? {}) as TData;
}

export function shouldClearSessionForRefreshError(error: unknown): boolean {
  return isAuthApiError(error) && [
    'auth.refresh.missingRefreshToken',
    'auth.refresh.invalidRefreshTokenCookie',
    'auth.refresh.invalidSession',
    'auth.refresh.ngoApprovalRequired',
  ].includes(error.errorKey ?? '');
}
