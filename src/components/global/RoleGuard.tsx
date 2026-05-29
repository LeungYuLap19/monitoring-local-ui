import { Navigate } from 'react-router-dom';
import type { AppRole } from '../../types/lib/auth';
import { getRoleFromToken } from '../../lib/utils/auth';

interface RoleGuardProps {
  allow: AppRole[];
  children: React.ReactNode;
}

export default function RoleGuard({ allow, children }: RoleGuardProps) {
  const tokenRole = getRoleFromToken();
  if (!tokenRole || !allow.includes(tokenRole)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
