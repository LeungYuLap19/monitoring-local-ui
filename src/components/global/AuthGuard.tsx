import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useRouteAccess } from '../../hooks/auth';

function FullPageChecking() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm font-semibold">
      Authenticating...
    </div>
  );
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const access = useRouteAccess('auth-only');
  if (access.isChecking) return <FullPageChecking />;
  if (access.deny) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function GuestGuard({ children }: { children: ReactNode }) {
  const access = useRouteAccess('guest-only');
  if (access.isChecking) return <FullPageChecking />;
  if (access.deny) return <Navigate to="/" replace />;
  return <>{children}</>;
}
