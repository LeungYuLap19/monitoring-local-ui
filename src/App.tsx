import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nProvider } from './lib/i18n';
import AuthenticatedLayout from './components/global/AuthenticatedLayout';
import RouteScrollReset from './components/global/RouteScrollReset';
import { Toaster } from './components/ui/sonner';
import { getStoredAccessToken, getStoredAuthUser, setStoredAccessToken, setStoredAuthUser } from './lib/utils/auth';
import { queryClient } from './lib/queryClient';

const OverviewPage = lazy(() => import('./pages/OverviewPage'));
const MonitoringPage = lazy(() => import('./pages/MonitoringPage'));

// Read token from hash BEFORE React renders (synchronous)
(function initHashToken() {
  const hash = window.location.hash;
  if (!hash) {
    // No hash = normal page load/refresh. Token is in-memory only, so it's gone.
    // Redirect to Vercel to re-authenticate.
    const vercelUrl = import.meta.env.VITE_VERCEL_URL || 'https://monitoring-dashboard-eosin.vercel.app';
    const returnPath = window.location.pathname;
    const lang = localStorage.getItem('hkbr_locale')?.replace(/"/g, '') || 'zh-TW';
    window.location.href = `${vercelUrl}/login?returnLocal=${encodeURIComponent(returnPath)}&lang=${lang}`;
    return;
  }
  const params = new URLSearchParams(hash.slice(1));
  const token = params.get('access_token');
  const userJson = params.get('user');
  const lang = params.get('lang');
  if (lang && (lang === 'en' || lang === 'zh-TW')) {
    localStorage.setItem('hkbr_locale', JSON.stringify(lang));
  }
  if (token) {
    const prevUser = getStoredAuthUser();
    queryClient.clear();
    window.sessionStorage.removeItem('pet-query-cache');
    setStoredAccessToken(token);
    let newUserId: string | undefined;
    if (userJson) {
      try {
        const parsed = JSON.parse(userJson);
        newUserId = parsed?.id;
        setStoredAuthUser(parsed);
      } catch { /* ignore */ }
    }
    const userChanged = !prevUser || prevUser.id !== newUserId;
    if (userChanged) {
      fetch('/api/xiaomi/logout', { method: 'POST' }).catch(() => {});
      fetch('/api/active_cams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"active_cams":[]}' }).catch(() => {});
    }
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