import { useEffect } from 'react';
import type { UseSessionHeartbeatOptions } from '../../types';
import { getStoredAccessToken, isAccessTokenExpired } from '../../lib/utils/auth';
import { refreshAuthSession } from '../../lib/services/authService';

export function useSessionHeartbeat({
  onUnauthorized,
  onUserRefresh,
  intervalMs = 60_000,
}: UseSessionHeartbeatOptions): void {
  useEffect(() => {
    let active = true;
    let isRefreshing = false;

    const tick = async () => {
      if (!active || isRefreshing) return;
      const token = getStoredAccessToken();
      if (!token) return;
      if (!isAccessTokenExpired(token, 120)) return;

      isRefreshing = true;
      try {
        const user = await refreshAuthSession();
        if (!active) return;
        if (!user) {
          onUnauthorized();
          return;
        }
        onUserRefresh?.(user);
      } catch {
        // Ignore transient refresh failures and retry on the next heartbeat.
      } finally {
        isRefreshing = false;
      }
    };

    void tick();
    const timer = window.setInterval(() => {
      void tick();
    }, intervalMs);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [intervalMs, onUnauthorized, onUserRefresh]);
}
