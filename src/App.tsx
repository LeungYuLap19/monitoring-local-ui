import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nProvider } from './lib/i18n';
import AuthenticatedLayout from './components/global/AuthenticatedLayout';
import RouteScrollReset from './components/global/RouteScrollReset';
import { Toaster } from './components/ui/sonner';
import { setStoredAccessToken, setStoredAuthUser } from './lib/utils/auth';

const OverviewPage = lazy(() => import('./pages/OverviewPage'));
const MonitoringPage = lazy(() => import('./pages/MonitoringPage'));

// Read token from hash BEFORE React renders (synchronous)
(function initHashToken() {
  const hash = window.location.hash;
  if (!hash) return;
  const params = new URLSearchParams(hash.slice(1));
  const token = params.get('access_token');
  const userJson = params.get('user');
  if (token) {
    setStoredAccessToken(token);
    if (userJson) {
      try {
        setStoredAuthUser(JSON.parse(userJson));
      } catch { /* ignore */ }
    }
    // Fresh login — reset local monitoring state
    fetch('/api/xiaomi/logout', { method: 'POST' }).catch(() => {});
    fetch('/api/active_cams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"active_cams":[]}' }).catch(() => {});
  }
  history.replaceState(null, '', window.location.pathname);
})();

export default function App() {

  return (
    <I18nProvider>
      <BrowserRouter>
        <RouteScrollReset />
        <Suspense fallback={null}>
          <Routes>
            <Route element={<AuthenticatedLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="overview" element={<Navigate to="/" replace />} />
              <Route path="monitoring" element={<MonitoringPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster />
    </I18nProvider>
  );
}