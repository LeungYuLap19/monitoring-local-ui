import { useCallback } from 'react';
import type { PetMonitorCameraIndex } from '../../types/lib/monitoring';
import {
  buildPetMonitorUrl,
  getPetMonitorRecordThumbnailUrl,
  getPetMonitorRecordVideoUrl,
  getPetMonitorVideoFeedUrl,
} from '../../lib/services/petMonitorService';

export function usePetMonitorUrls() {
  const getVideoFeedUrl = useCallback((camId: PetMonitorCameraIndex) => (
    getPetMonitorVideoFeedUrl(camId)
  ), []);

  const getRecordVideoUrl = useCallback((filename: string) => (
    getPetMonitorRecordVideoUrl(filename)
  ), []);

  const getRecordThumbnailUrl = useCallback((filename: string) => (
    getPetMonitorRecordThumbnailUrl(filename)
  ), []);

  const getApiUrl = useCallback((path: string) => buildPetMonitorUrl(path), []);

  return {
    getApiUrl,
    getVideoFeedUrl,
    getRecordVideoUrl,
    getRecordThumbnailUrl,
  };
}
