import axios, {
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import type {
  AuthChallengeRequest,
  AuthRegisterUserRequest,
  AuthRegisterUserResponseData,
  AuthRefreshResponseData,
  AuthUser,
  AuthVerifyRequest,
  AuthVerifyResponseData,
  LoginMethod,
  NgoLoginResponseData,
  UserMeResponseData,
} from '../../types/lib/auth';
import type {
  ApiErrorEnvelope,
  ProtectedApiResult,
  ApiSuccessEnvelope,
  ProtectedPaginatedApiResult,
} from '../../types/lib/api';
import {
  AuthApiError,
  clearManualSignOut,
  clearStoredAuthSession,
  decodeJwtPayload,
  getAuthIdentifier,
  getStoredAccessToken,
  getStoredAuthUser,
  isManualSignOutActive,
  isAccessTokenExpired,
  isAuthApiError,
  mapStatusToErrorKey,
  markManualSignOut,
  setStoredAccessToken,
  setStoredAuthUser,
  toAuthUser,
} from '../utils/auth';
import {
  createAuthApiClient,
  getAuthApiHeaders,
  shouldClearSessionForRefreshError,
  toAuthApiError,
  unwrapAuthData,
  unwrapAuthEnvelope,
} from '../utils/services/auth-service';
import {
  asString,
  clearContentTypeHeader,
  isFormDataPayload,
  isObjectRecord,
  readErrorMessage,
} from '../utils/http/http';

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');
const API_KEY = import.meta.env.VITE_API_KEY;

const publicAuthClient = createAuthApiClient(API_BASE_URL, API_KEY, false);
const cookieAuthClient = createAuthApiClient(API_BASE_URL, API_KEY, true);
const protectedApiClient = createAuthApiClient(API_BASE_URL, API_KEY, false);
let authClearEpoch = 0;

protectedApiClient.interceptors.request.use((config) => {
  if (isFormDataPayload(config.data)) {
    clearContentTypeHeader(config);
  }

  const token = getStoredAccessToken();
  if (!config.headers) {
    config.headers = {} as any;
  }
  (config.headers as Record<string, string>).Authorization = token ? `Bearer ${token}` : 'Bearer none';
  return config;
});

let refreshInFlight: Promise<AuthUser | null> | null = null;

async function fetchCurrentUserWithToken(token: string): Promise<AuthUser> {
  const payload = decodeJwtPayload(token);
  const tokenRole = payload?.userRole ?? payload?.role;

  try {
    if (tokenRole === 'ngo') {
      const response = await publicAuthClient.get<ApiSuccessEnvelope<{ userProfile?: UserMeResponseData; ngoProfile?: { _id?: string } }>>('/ngo/me', {
        headers: {
          ...getAuthApiHeaders(API_KEY),
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data.data ?? {};
      const user = toAuthUser(data.userProfile ?? {}, 'ngo', data.ngoProfile?._id);
      return user;
    }

    const response = await publicAuthClient.get<ApiSuccessEnvelope<UserMeResponseData>>('/user/me', {
      headers: {
        ...getAuthApiHeaders(API_KEY),
        Authorization: `Bearer ${token}`,
      },
    });
    return toAuthUser(response.data.data ?? {});
  } catch (error) {
    throw toAuthApiError(error);
  }
}

protectedApiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const normalizedError = toAuthApiError(error);
    const originalConfig = (axios.isAxiosError(error) ? error.config : null) as RetryableConfig | null;

    if (!originalConfig || originalConfig._retry || normalizedError.status !== 401) {
      throw normalizedError;
    }

    originalConfig._retry = true;

    try {
      const refreshedUser = await refreshAuthSession();
      if (!refreshedUser) {
        throw normalizedError;
      }
      const token = getStoredAccessToken();
      if (token) {
        if (!originalConfig.headers) {
          originalConfig.headers = {} as any;
        }
        (originalConfig.headers as Record<string, string>).Authorization = `Bearer ${token}`;
      }
      return await protectedApiClient.request(originalConfig);
    } catch (refreshError) {
      if (isAuthApiError(refreshError)) {
        throw refreshError;
      }
      throw normalizedError;
    }
  },
);

export async function requestProtectedApi<TData>(config: AxiosRequestConfig): Promise<TData> {
  return unwrapAuthData(
    protectedApiClient.request<ApiSuccessEnvelope<TData> | ApiErrorEnvelope>(config),
  );
}

export async function requestProtectedApiResult<TData>(config: AxiosRequestConfig): Promise<ProtectedApiResult<TData>> {
  const payload = await unwrapAuthEnvelope(
    protectedApiClient.request<ApiSuccessEnvelope<TData> | ApiErrorEnvelope>(config),
  );

  return {
    data: payload.data as TData,
    message: payload.message,
    requestId: payload.requestId,
  };
}

export async function requestProtectedApiWithMeta<TData>(config: AxiosRequestConfig): Promise<ProtectedPaginatedApiResult<TData>> {
  const payload = await unwrapAuthEnvelope(
    protectedApiClient.request<ApiSuccessEnvelope<TData> | ApiErrorEnvelope>(config),
  );

  return {
    data: (payload.data ?? {}) as TData,
    message: payload.message,
    requestId: payload.requestId,
    pagination: payload.pagination ?? null,
  };
}

export async function createOtpChallenge(params: {
  loginMethod: LoginMethod;
  inputValue: string;
  regionCode: string;
  locale: string;
}): Promise<void> {
  const identifier = getAuthIdentifier(params.loginMethod, params.inputValue, params.regionCode);
  const body: AuthChallengeRequest = params.loginMethod === 'email'
    ? { email: identifier.email, lang: params.locale }
    : { phoneNumber: identifier.phoneNumber };

  await unwrapAuthData(
    publicAuthClient.post<ApiSuccessEnvelope<unknown> | ApiErrorEnvelope>('/auth/challenges', body),
  );
}

export async function verifyOtpChallenge(params: {
  loginMethod: LoginMethod;
  inputValue: string;
  regionCode: string;
  code: string;
  locale: string;
  accessToken?: string;
}): Promise<AuthVerifyResponseData> {
  const identifier = getAuthIdentifier(params.loginMethod, params.inputValue, params.regionCode);
  const body: AuthVerifyRequest = params.loginMethod === 'email'
    ? { email: identifier.email, code: params.code, lang: params.locale }
    : { phoneNumber: identifier.phoneNumber, code: params.code };

  return unwrapAuthData(
    cookieAuthClient.post<ApiSuccessEnvelope<AuthVerifyResponseData> | ApiErrorEnvelope>(
      '/auth/challenges/verify',
      body,
      {
        headers: params.accessToken
          ? { Authorization: `Bearer ${params.accessToken}` }
          : undefined,
      },
    ),
  );
}

export async function registerUserFromOtp(params: {
  loginMethod: LoginMethod;
  inputValue: string;
  regionCode: string;
  firstName: string;
  lastName: string;
}): Promise<AuthRegisterUserResponseData> {
  const identifier = getAuthIdentifier(params.loginMethod, params.inputValue, params.regionCode);
  const body: AuthRegisterUserRequest = {
    firstName: params.firstName.trim(),
    lastName: params.lastName.trim(),
    email: identifier.email,
    phoneNumber: identifier.phoneNumber,
  };

  return unwrapAuthData(
    cookieAuthClient.post<ApiSuccessEnvelope<AuthRegisterUserResponseData> | ApiErrorEnvelope>(
      '/auth/registrations/user',
      body,
    ),
  );
}

export async function loginNgo(email: string, password: string): Promise<NgoLoginResponseData> {
  return unwrapAuthData(
    cookieAuthClient.post<ApiSuccessEnvelope<NgoLoginResponseData> | ApiErrorEnvelope>(
      '/auth/login/ngo',
      { email, password },
    ),
  );
}

export async function refreshAccessToken(): Promise<AuthRefreshResponseData> {
  return unwrapAuthData(
    cookieAuthClient.post<ApiSuccessEnvelope<AuthRefreshResponseData> | ApiErrorEnvelope>(
      '/auth/tokens/refresh',
      {},
    ),
  );
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  try {
    const response = await protectedApiClient.get<ApiSuccessEnvelope<UserMeResponseData> | ApiErrorEnvelope>(
      '/user/me',
    );
    if (isObjectRecord(response.data) && response.data.success === false) {
      throw new AuthApiError({
        status: 400,
        message: readErrorMessage(response.data, 'Request failed'),
        errorKey: asString(response.data.errorKey),
        requestId: asString(response.data.requestId),
        details: response.data,
      });
    }
    return toAuthUser((response.data as ApiSuccessEnvelope<UserMeResponseData>).data ?? {});
  } catch (error) {
    throw toAuthApiError(error);
  }
}

export function clearAuthSession(): void {
  authClearEpoch += 1;
  clearStoredAuthSession();
}

export function logoutAuthSession(): void {
  const vercelUrl = import.meta.env.VITE_VERCEL_URL || 'https://monitoring-dashboard-eosin.vercel.app';
  window.location.replace(`${vercelUrl}/login`);
}

export async function bootstrapSessionWithToken(token: string, fallbackRole?: string, ngoId?: string): Promise<AuthUser> {
  const clearEpochAtStart = authClearEpoch;

  try {
    clearManualSignOut();
    setStoredAccessToken(token);
    const user = await fetchCurrentUserWithToken(token);
    if (clearEpochAtStart !== authClearEpoch || isManualSignOutActive()) {
      throw new AuthApiError({
        status: 0,
        message: 'Session was cleared before bootstrap completed',
        errorKey: 'auth.session.cleared',
      });
    }
    if (!user.role && fallbackRole) {
      user.role = fallbackRole as AuthUser['role'];
    }
    if (ngoId) {
      user.ngoId = ngoId;
    }
    setStoredAuthUser(user);
    return user;
  } catch (error) {
    clearAuthSession();
    throw error;
  }
}

export async function refreshAuthSession(): Promise<AuthUser | null> {
  // Local frontend cannot refresh tokens (cookie is bound to AWS domain).
  // Redirect to Vercel to re-authenticate and come back with a fresh token.
  const vercelUrl = import.meta.env.VITE_VERCEL_URL || 'https://monitoring-dashboard-eosin.vercel.app';
  const returnPath = window.location.pathname;
  window.location.href = `${vercelUrl}/login?returnLocal=${encodeURIComponent(returnPath)}`;
  return null;
}

export async function ensureAuthenticatedSession(): Promise<AuthUser | null> {
  if (isManualSignOutActive()) {
    clearAuthSession();
    return null;
  }

  const token = getStoredAccessToken();

  if (token && !isAccessTokenExpired(token)) {
    try {
      const user = await fetchCurrentUserWithToken(token);
      setStoredAuthUser(user);
      return user;
    } catch {
      // fall through to refresh path
    }
  }

  try {
    const refreshedUser = await refreshAuthSession();
    if (!refreshedUser) {
      clearAuthSession();
      return null;
    }
    return refreshedUser;
  } catch {
    // Transient refresh failures should not invalidate a potentially recoverable session.
    return null;
  }
}

export function getCurrentSessionUser(): AuthUser | null {
  return getStoredAuthUser();
}
