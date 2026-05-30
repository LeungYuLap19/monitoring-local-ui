import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { PET_GUESTS } from '../../constants';
import { useTranslation } from '../../lib/i18n';
import { clearAuthSession, getCurrentSessionUser, logoutAuthSession } from '../../lib/services/authService';
import { AUTH_STORAGE_KEYS, getRoleFromToken, isManualSignOutActive } from '../../lib/utils/auth';
import { toActivityClips } from '../../lib/utils/services/pet-monitor-ui';
import type { AuthUser, TabId } from '../../types';
import { usePetMonitorRecords } from '../monitoring';
import { useXiaomiStatus } from '../monitoring/useXiaomiStatus';
import { useSessionHeartbeat } from '../auth';
import { toast } from 'sonner';
import axios from 'axios';
import { PET_MONITOR_API_BASE_URL } from '../../lib/services/petMonitorService';

export function useAuthenticatedLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const user = getCurrentSessionUser();
    if (!user) return null;
    const tokenRole = getRoleFromToken();
    if (tokenRole) user.role = tokenRole;
    return user;
  });
  const [petsList, setPetsList] = useState(PET_GUESTS);
  const [selectedPetId, setSelectedPetId] = useState<string>('momo');
  const [isClipsOpen, setIsClipsOpen] = useState(false);
  const [isLogPreviewOpen, setIsLogPreviewOpen] = useState(false);
  const [isXiaomiLoginOpen, setIsXiaomiLoginOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasUnsentLogs, setHasUnsentLogs] = useState(true);
  const monitorRecords = usePetMonitorRecords({ autoLoad: true });
  const xiaomiStatus = useXiaomiStatus();

  const showToast = useCallback((message: string) => {
    toast.success(message);
  }, []);

  const activePetObj = useMemo(
    () => petsList.find((b) => b.id === selectedPetId) || petsList[0],
    [petsList, selectedPetId],
  );

  const monitorClips = useMemo(
    () => toActivityClips(monitorRecords.records, monitorRecords.getRecordThumbnailUrl),
    [monitorRecords.records, monitorRecords.getRecordThumbnailUrl],
  );

  const activeTab: TabId = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/monitoring')) return 'monitoring';
    if (path.startsWith('/pets')) return 'pets';
    if (path.startsWith('/client-view')) return 'client-view';
    if (path.startsWith('/subscription')) return 'none';
    return 'overview';
  }, [location.pathname]);

  const handleNavigateTab = (tab: TabId) => {
    navigate(`/${tab === 'overview' ? '' : tab}`);
  };

  const handleSelectCameraFromOverview = (camId: string) => {
    setSelectedPetId(camId);
    navigate('/monitoring');
    showToast(t('monitoring.toasts.cameraSwitch'));
  };

  const handleSelectPetFromOverview = (petId: string) => {
    setSelectedPetId(petId);
    navigate('/monitoring');
  };

  const handleLogSendSuccess = () => {
    setIsLogPreviewOpen(false);
    setHasUnsentLogs(false);
    showToast(t('monitoring.logPreview.sendSuccess', { name: activePetObj.name }));
    setTimeout(() => navigate('/client-view'), 400);
  };

  const redirectToLogin = useCallback((message: string) => {
    setCurrentUser(null);
    setIsSidebarOpen(false);
    showToast(message);
    navigate('/login', { replace: true });
  }, [navigate, showToast]);

  const handleLogout = useCallback(() => {
    queryClient.clear();
    window.sessionStorage.removeItem('pet-query-cache');
    const vercelUrl = import.meta.env.VITE_VERCEL_URL || 'https://monitoring-dashboard-eosin.vercel.app';
    window.location.href = `${vercelUrl}/login?logout=true`;
  }, [queryClient]);

  const handleXiaomiLogout = useCallback(async () => {
    try {
      await axios.post(`${PET_MONITOR_API_BASE_URL}/api/xiaomi/logout`);
      await axios.post(`${PET_MONITOR_API_BASE_URL}/api/active_cams`, { active_cams: [] });
      await new Promise((r) => setTimeout(r, 1500));
      await xiaomiStatus.refresh();
      toast.success(t('xiaomi.disconnected'));
    } catch {
      toast.error(t('xiaomi.disconnectFailed'));
    }
  }, [xiaomiStatus, t]);

  const handleSessionExpired = useCallback(() => {
    queryClient.clear();
    clearAuthSession();
    redirectToLogin(t('auth.errors.sessionExpired'));
  }, [queryClient, redirectToLogin, t]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage || event.key !== AUTH_STORAGE_KEYS.manualSignOut) {
        return;
      }
      if (!isManualSignOutActive()) {
        return;
      }

      clearAuthSession();
      setCurrentUser(null);
      setIsSidebarOpen(false);
      showToast(t('auth.toasts.loggedOut'));
      navigate('/login', { replace: true });
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [navigate, showToast, t]);

  useSessionHeartbeat({
    onUnauthorized: handleSessionExpired,
    onUserRefresh: (user) => setCurrentUser(user),
  });

  return {
    currentUser,
    activeTab,
    petsList,
    setPetsList,
    selectedPetId,
    setSelectedPetId,
    activePetObj,
    isClipsOpen,
    setIsClipsOpen,
    isLogPreviewOpen,
    setIsLogPreviewOpen,
    isXiaomiLoginOpen,
    setIsXiaomiLoginOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    hasUnsentLogs,
    toastMessage: null as string | null,
    showToast,
    navigate,
    handleNavigateTab,
    handleSelectCameraFromOverview,
    handleSelectPetFromOverview,
    handleLogSendSuccess,
    handleLogout,
    handleXiaomiLogout,
    xiaomiConnected: xiaomiStatus.isConnected,
    refreshXiaomiStatus: xiaomiStatus.refresh,
    monitorClips,
    getMonitorClipVideoUrl: monitorRecords.getRecordVideoUrl,
  };
}
