import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nProvider } from './lib/i18n';
import AuthenticatedLayout from './components/global/AuthenticatedLayout';
import RouteScrollReset from './components/global/RouteScrollReset';
import { Toaster } from './components/ui/sonner';
import { setStoredAccessToken, setStoredAuthUser } from './lib/utils/auth';

const OverviewPage = lazy(() => import('./pages/OverviewPage'));
const MonitoringPage = lazy(() => import('./pages/MonitoringPage'));

function useHashToken() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const params = new URLSearchParams(hash.slice(1));
    const token = params.get('access_token');
    const userJson = params.get('user');
    if (token) {
      setStoredAccessToken(token);
      if (userJson) {
        try {
          setStoredAuthUser(JSON.parse(decodeURIComponent(userJson)));
        } catch { /* ignore */ }
      }
    }
    history.replaceState(null, '', window.location.pathname);
  }, []);
}

export default function App() {
  useHashToken();

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