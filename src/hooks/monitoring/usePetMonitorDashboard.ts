import { useCallback } from 'react';
import type { UsePetMonitorDashboardOptions } from '../../types';
import { usePetMonitorActiveCameras } from './usePetMonitorActiveCameras';
import { usePetMonitorRecords } from './usePetMonitorRecords';
import { useBehaviorSSE } from './useBehaviorSSE';
import { usePetMonitorUrls } from './usePetMonitorUrls';

export function usePetMonitorDashboard(options: UsePetMonitorDashboardOptions = {}) {
  const {
    autoLoad = true,
    recordsQuery = {},
  } = options;

  const sse = useBehaviorSSE();
  const activeCameras = usePetMonitorActiveCameras({ autoLoad });
  const records = usePetMonitorRecords({
    initialQuery: recordsQuery,
    autoLoad,
  });
  const urls = usePetMonitorUrls();

  const refreshDashboard = useCallback(async () => {
    await Promise.all([
      activeCameras.refreshActiveCameras(),
      records.refreshRecords(),
    ]);
  }, [activeCameras, records]);

  const reconnectDashboard = useCallback(async () => {
    sse.reconnect();
    await Promise.all([
      activeCameras.reconnectActiveCameras(),
      records.reconnectRecords(),
    ]);
  }, [activeCameras, records, sse]);

  return {
    sse,
    activeCameras,
    records,
    urls,
    isLoading: activeCameras.isLoading || records.isLoading,
    isBlocked: activeCameras.isBlocked || records.isBlocked,
    error: activeCameras.error || records.error,
    refreshDashboard,
    reconnectDashboard,
  };
}
