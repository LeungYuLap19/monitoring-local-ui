import type { LoginMethod, AuthApiErrorInfo, AuthUser, UserMeResponseData } from '../../types/lib/auth';
import { readStorageJson, writeStorageJson } from './storage';

export const AUTH_STORAGE_KEYS = {
  authUser: 'hkbr_auth_user',
  manualSignOut: 'hkbr_manual_sign_out',
} as const;

let inMemoryAccessToken: string | null = null;

export class AuthApiError extends Error {
  readonly status: number;
  readonly errorKey?: string;
  readonly requestId?: string;
  readonly details?: unknown;

  constructor({ status, errorKey, message, requestId, details }: AuthApiErrorInfo) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
    this.errorKey = errorKey;
    this.requestId = requestId;
    this.details = details;
    Object.setPrototypeOf(this, AuthApiError.prototype);
  }
}

export function isAuthApiError(error: unknown): error is AuthApiError {
  return error instanceof AuthApiError;
}

export function getStoredAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function setStoredAccessToken(token: string): void {
  inMemoryAccessToken = token;
}

export function getStoredAuthUser(): AuthUser | null {
  return readStorageJson<AuthUser | null>(
    typeof window === 'undefined' ? undefined : window.sessionStorage,
    AUTH_STORAGE_KEYS.authUser,
    null,
  );
}

export function setStoredAuthUser(user: AuthUser): void {
  writeStorageJson(
    typeof window === 'undefined' ? undefined : window.sessionStorage,
    AUTH_STORAGE_KEYS.authUser,
    user,
  );
}

export function clearStoredAuthSession(): void {
  inMemoryAccessToken = null;
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(AUTH_STORAGE_KEYS.authUser);
}

export function markManualSignOut(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUTH_STORAGE_KEYS.manualSignOut, String(Date.now()));
}

export function clearManualSignOut(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_STORAGE_KEYS.manualSignOut);
}

export function isManualSignOutActive(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.localStorage.getItem(AUTH_STORAGE_KEYS.manualSignOut));
}

export function toE164Phone(rawPhone: string, regionCode: string): string {
  const normalizedPhone = rawPhone.trim().replace(/[^\d+]/g, '');
  if (!normalizedPhone) return normalizedPhone;
  if (normalizedPhone.startsWith('+')) return normalizedPhone;
  const normalizedRegion = regionCode.startsWith('+') ? regionCode : `+${regionCode}`;
  return `${normalizedRegion}${normalizedPhone}`;
}

export function getAuthIdentifier(method: LoginMethod, inputValue: string, regionCode: string): {
  email?: string;
  phoneNumber?: string;
  emailOrPhone: string;
} {
  if (method === 'email') {
    const email = inputValue.trim().toLowerCase();
    return { email, emailOrPhone: email };
  }
  const phoneNumber = toE164Phone(inputValue, regionCode);
  return { phoneNumber, emailOrPhone: phoneNumber };
}

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const segments = token.split('.');
  if (segments.length < 2) return null;
  try {
    const payload = segments[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, '='));
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function isAccessTokenExpired(token: string, skewSeconds: number = 30): boolean {
  const payload = decodeJwtPayload(token);
  const exp = typeof payload?.exp === 'number' ? payload.exp : null;
  if (!exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return exp <= now + skewSeconds;
}

export function mapStatusToErrorKey(status: number, message?: string): string | undefined {
  if (status === 401 || /unauthorized/i.test(message ?? '')) return 'common.unauthorized';
  if (status === 403 || /forbidden/i.test(message ?? '')) return 'common.forbidden';
  if (status === 404 || /not[ -]?found/i.test(message ?? '')) return 'common.notFound';
  if (status === 429) return 'common.rateLimited';
  if (status >= 500) return 'common.internalError';
  return undefined;
}

export function toAuthUser(data: UserMeResponseData, fallbackRole?: string, ngoId?: string): AuthUser {
  const emailOrPhone = data.email ?? data.phoneNumber;
  return {
    id: data._id,
    emailOrPhone,
    firstName: data.firstName ?? '',
    lastName: data.lastName ?? '',
    role: (data.role ?? fallbackRole ?? 'user') as AuthUser['role'],
    email: data.email,
    phoneNumber: data.phoneNumber,
    isVerified: data.verified,
    ngoId,
  };
}

export function getRoleFromToken(): AuthUser['role'] | null {
  const token = getStoredAccessToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const role = payload.userRole ?? payload.role;
  if (role === 'user' || role === 'ngo') return role;
  return null;
}
