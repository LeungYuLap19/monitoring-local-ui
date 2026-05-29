import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  PetMonitorDeleteVideoRecordResponse,
  PetMonitorVideoRecord,
  PetMonitorVideoRecordsQuery,
  PetMonitorVideoRecordsResponse,
} from '../../types/lib/monitoring';
import type { UsePetMonitorRecordsOptions } from '../../types';
import {
  deletePetMonitorVideoRecord,
  getPetMonitorRecordThumbnailUrl,
  getPetMonitorRecordVideoUrl,
  getPetMonitorVideoRecords,
} from '../../lib/services/petMonitorService';
import { usePetMonitorRequest } from './usePetMonitorRequest';

export function usePetMonitorRecords(options: UsePetMonitorRecordsOptions = {}) {
  const { initialQuery = {}, autoLoad = true } = options;
  const [query, setQuery] = useState<PetMonitorVideoRecordsQuery>(initialQuery);
  const [records, setRecords] = useState<PetMonitorVideoRecord[]>([]);
  const [deleteResult, setDeleteResult] = useState<PetMonitorDeleteVideoRecordResponse | null>(null);
  const queryRef = useRef<PetMonitorVideoRecordsQuery>(initialQuery);
  const loadRequest = usePetMonitorRequest();
  const deleteRequest = usePetMonitorRequest();
  const {
    runRequest: runLoadRequest,
    resetRequest: resetLoadRequest,
    reconnectRequest: reconnectLoadRequest,
  } = loadRequest;
  const { runRequest: runDeleteRequest, resetRequest: resetDeleteRequest } = deleteRequest;

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  const loadRecords = useCallback((nextQuery?: PetMonitorVideoRecordsQuery) => {
    const resolvedQuery = nextQuery ?? queryRef.current;
    queryRef.current = resolvedQuery;
    setQuery(resolvedQuery);

    return runLoadRequest(
      () => getPetMonitorVideoRecords(resolvedQuery),
      {
        fallbackMessage: 'Failed to fetch PetMonitor video records',
        onSuccess: (result: PetMonitorVideoRecordsResponse) => setRecords(result.records),
        onError: () => setRecords([]),
      },
    );
  }, [runLoadRequest]);

  const removeRecord = useCallback((recordId: number) => runDeleteRequest(
    () => deletePetMonitorVideoRecord(recordId),
    {
      fallbackMessage: `Failed to delete PetMonitor video record ${recordId}`,
      onSuccess: (result) => {
        setDeleteResult(result);
        if (result.success) {
          setRecords((currentRecords) => currentRecords.filter((record) => record.id !== recordId));
        }
      },
    },
  ), [runDeleteRequest]);

  const getRecordVideoUrl = useCallback((filename: string) => getPetMonitorRecordVideoUrl(filename), []);
  const getRecordThumbnailUrl = useCallback((filename: string) => getPetMonitorRecordThumbnailUrl(filename), []);

  const resetRecords = useCallback(() => {
    setRecords([]);
    setDeleteResult(null);
    resetLoadRequest();
    resetDeleteRequest();
  }, [resetDeleteRequest, resetLoadRequest]);

  useEffect(() => {
    if (!autoLoad) return;
    void loadRecords(queryRef.current).catch(() => undefined);
  }, [autoLoad, loadRecords]);

  return {
    query,
    records,
    deleteResult,
    isLoading: loadRequest.isLoading,
    isDeleting: deleteRequest.isLoading,
    hasLoaded: loadRequest.hasLoaded,
    error: loadRequest.error ?? deleteRequest.error,
    consecutiveFailures: loadRequest.consecutiveFailures,
    isBlocked: loadRequest.isBlocked,
    setQuery,
    loadRecords,
    refreshRecords: loadRecords,
    reconnectRecords: () => {
      reconnectLoadRequest();
      return loadRecords();
    },
    deleteRecord: removeRecord,
    getRecordVideoUrl,
    getRecordThumbnailUrl,
    resetRecords,
  };
}
