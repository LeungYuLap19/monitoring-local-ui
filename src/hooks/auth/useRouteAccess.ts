import { useEffect, useState } from 'react';
import { ensureAuthenticatedSession } from '../../lib/services/authService';
import type { RouteGuardMode, RouteGuardStatus } from '../../types';

export function useRouteAccess(mode: RouteGuardMode) {
  const [status, setStatus] = useState<RouteGuardStatus>('checking');

  useEffect(() => {
    let mounted = true;

    (async () => {
      const user = await ensureAuthenticatedSession();
      if (!mounted) return;
      setStatus(user ? 'authed' : 'unauth');
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (mode === 'auth-only') {
    return {
      status,
      isChecking: status === 'checking',
      allow: status === 'authed',
      deny: status === 'unauth',
    };
  }

  return {
    status,
    isChecking: status === 'checking',
    allow: status === 'unauth',
    deny: status === 'authed',
  };
}
