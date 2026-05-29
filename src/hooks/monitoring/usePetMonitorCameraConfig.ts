import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  PetMonitorCameraConfigUpdateResponse,
  PetMonitorCameraIndex,
  PetMonitorCameraRuntimeConfig,
  PetMonitorCameraRuntimeConfigUpdate,
} from '../../types/lib/monitoring';
import type { UsePetMonitorCameraConfigOptions } from '../../types';
import {
  getPetMonitorCameraConfig,
  updatePetMonitorCameraConfig,
} from '../../lib/services/petMonitorService';
import { usePetMonitorRequest } from './usePetMonitorRequest';

export function usePetMonitorCameraConfig(options: UsePetMonitorCameraConfigOptions = {}) {
  const {
    initialCamId = null,
    autoLoad = Boolean(initialCamId),
  } = options;

  const [camId, setCamId] = useState<PetMonitorCameraIndex | null>(initialCamId);
  const [config, setConfig] = useState<PetMonitorCameraRuntimeConfig | null>(null);
  const [updateResult, setUpdateResult] = useState<PetMonitorCameraConfigUpdateResponse | null>(null);
  const camIdRef = useRef<PetMonitorCameraIndex | null>(initialCamId);
  const loadRequest = usePetMonitorRequest();
  const updateRequest = usePetMonitorRequest();
  const { runRequest: runLoadRequest, resetRequest: resetLoadRequest } = loadRequest;
  const { runRequest: runUpdateRequest, resetRequest: resetUpdateRequest } = updateRequest;

  useEffect(() => {
    camIdRef.current = camId;
  }, [camId]);

  const loadCameraConfig = useCallback((nextCamId?: PetMonitorCameraIndex) => {
    const resolvedCamId = nextCamId ?? camIdRef.current;

    if (resolvedCamId === null) {
      const missingCamIdError = new Error('Camera id is required to fetch PetMonitor camera config');
      return Promise.reject(missingCamIdError);
    }

    camIdRef.current = resolvedCamId;
    setCamId(resolvedCamId);

    return runLoadRequest(
      () => getPetMonitorCameraConfig(resolvedCamId),
      {
        fallbackMessage: `Failed to fetch PetMonitor config for camera ${resolvedCamId}`,
        onSuccess: (result) => setConfig(result),
        onError: () => setConfig(null),
      },
    );
  }, [runLoadRequest]);

  const updateCameraConfig = useCallback((
    payload: PetMonitorCameraRuntimeConfigUpdate,
    nextCamId?: PetMonitorCameraIndex,
  ) => {
    const resolvedCamId = nextCamId ?? camIdRef.current;

    if (resolvedCamId === null) {
      const missingCamIdError = new Error('Camera id is required to update PetMonitor camera config');
      return Promise.reject(missingCamIdError);
    }

    camIdRef.current = resolvedCamId;
    setCamId(resolvedCamId);

    return runUpdateRequest(
      () => updatePetMonitorCameraConfig(resolvedCamId, payload),
      {
        fallbackMessage: `Failed to update PetMonitor config for camera ${resolvedCamId}`,
        onSuccess: (result) => {
          setUpdateResult(result);
          if (result.config) {
            setConfig(result.config);
          }
        },
      },
    );
  }, [runUpdateRequest]);

  const refreshCameraConfig = useCallback(() => loadCameraConfig(), [loadCameraConfig]);

  const resetCameraConfig = useCallback(() => {
    setConfig(null);
    setUpdateResult(null);
    resetLoadRequest();
    resetUpdateRequest();
  }, [resetLoadRequest, resetUpdateRequest]);

  useEffect(() => {
    if (!autoLoad || initialCamId === null) return;
    void loadCameraConfig(initialCamId).catch(() => undefined);
  }, [autoLoad, initialCamId, loadCameraConfig]);

  return {
    camId,
    config,
    updateResult,
    isLoading: loadRequest.isLoading,
    isSubmitting: updateRequest.isLoading,
    hasLoaded: loadRequest.hasLoaded,
    error: loadRequest.error ?? updateRequest.error,
    setCamId,
    loadCameraConfig,
    refreshCameraConfig,
    updateCameraConfig,
    resetCameraConfig,
  };
}
