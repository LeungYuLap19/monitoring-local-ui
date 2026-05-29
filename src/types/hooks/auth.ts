import type { AuthUser } from '../lib/auth';

export type AuthStep = 'input' | 'otp' | 'register';
export type AuthAction = 'challenge' | 'verify' | 'register';

export type RouteGuardStatus = 'checking' | 'authed' | 'unauth';
export type RouteGuardMode = 'auth-only' | 'guest-only';

export interface UseSessionHeartbeatOptions {
  onUnauthorized: () => void;
  onUserRefresh?: (user: AuthUser) => void;
  intervalMs?: number;
}
