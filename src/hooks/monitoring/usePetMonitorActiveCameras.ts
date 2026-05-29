import { useCallback, useEffect, useState } from 'react';
import type { PetMonitorCameraIndex } from '../../types/lib/monitoring';
import type { UsePetMonitorActiveCamerasOptions } from '../../types';
import {
  getPetMonitorActiveCameras,
  setPetMonitorActiveCameras,
} from '../../lib/services/petMonitorService';
import { usePetMonitorRequest } from './usePetMonitorRequest';

export function usePetMonitorActiveCameras(options: UsePetMonitorActiveCamerasOptions = {}) {
  const { autoLoad = true } = options;
  const [activeCameras, setActiveCamerasState] = useState<PetMonitorCameraIndex[]>([]);
  const loadRequest = usePetMonitorRequest();
  const updateRequest = usePetMonitorRequest();
  const {
    runRequest: runLoadRequest,
    resetRequest: resetLoadRequest,
    reconnectRequest: reconnectLoadRequest,
  } = loadRequest;
  const { runRequest: runUpdateRequest, resetRequest: resetUpdateRequest } = updateRequest;

  const loadActiveCameras = useCallback(() => runLoadRequest(
    getPetMonitorActiveCameras,
    {
      fallbackMessage: 'Failed to fetch active PetMonitor cameras',
      onSuccess: (result) => setActiveCamerasState(result),
      onError: () => setActiveCamerasState([]),
    },
  ), [runLoadRequest]);

  const setActiveCameras = useCallback((nextActiveCameras: PetMonitorCameraIndex[]) => runUpdateRequest(
    () => setPetMonitorActiveCameras(nextActiveCameras),
    {
      fallbackMessage: 'Failed to update active PetMonitor cameras',
      onSuccess: (result) => setActiveCamerasState(result.active_cams),
    },
  ), [runUpdateRequest]);

  const toggleActiveCamera = useCallback((camId: PetMonitorCameraIndex) => {
    const nextActiveCameras = activeCameras.includes(camId)
      ? activeCameras.filter((activeCamId) => activeCamId !== camId)
      : [...activeCameras, camId];

    return setActiveCameras(nextActiveCameras);
  }, [activeCameras, setActiveCameras]);

  const resetActiveCameras = useCallback(() => {
    setActiveCamerasState([]);
    resetLoadRequest();
    resetUpdateRequest();
  }, [resetLoadRequest, resetUpdateRequest]);

  useEffect(() => {
    if (!autoLoad) return;
    void loadActiveCameras().catch(() => undefined);
  }, [autoLoad, loadActiveCameras]);

  return {
    activeCameras,
    isLoading: loadRequest.isLoading,
    isSubmitting: updateRequest.isLoading,
    hasLoaded: loadRequest.hasLoaded,
    error: loadRequest.error ?? updateRequest.error,
    consecutiveFailures: loadRequest.consecutiveFailures,
    isBlocked: loadRequest.isBlocked,
    loadActiveCameras,
    refreshActiveCameras: loadActiveCameras,
    reconnectActiveCameras: () => {
      reconnectLoadRequest();
      return loadActiveCameras();
    },
    setActiveCameras,
    toggleActiveCamera,
    resetActiveCameras,
  };
}
