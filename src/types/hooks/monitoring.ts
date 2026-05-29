import type {
  PetMonitorBehaviorLogsQuery,
  PetMonitorBehaviorTimelineQuery,
  PetMonitorCameraIndex,
  PetMonitorVideoRecordsQuery,
} from '../lib/monitoring';

export interface PetMonitorRequestState {
  isLoading: boolean;
  hasLoaded: boolean;
  error: Error | null;
  consecutiveFailures: number;
  isBlocked: boolean;
}

export interface RunPetMonitorRequestOptions<TData> {
  fallbackMessage: string;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

export interface UsePetMonitorActiveCamerasOptions {
  autoLoad?: boolean;
}

export interface UsePetMonitorCameraConfigOptions {
  initialCamId?: PetMonitorCameraIndex | null;
  autoLoad?: boolean;
}

export interface UsePetMonitorBehaviorOptions {
  initialLogsQuery?: PetMonitorBehaviorLogsQuery | null;
  initialTimelineQuery?: PetMonitorBehaviorTimelineQuery | null;
  autoLoadLogs?: boolean;
  autoLoadTimeline?: boolean;
}

export interface UsePetMonitorRecordsOptions {
  initialQuery?: PetMonitorVideoRecordsQuery;
  autoLoad?: boolean;
}

export interface UsePetMonitorDashboardOptions {
  autoLoad?: boolean;
  recordsQuery?: PetMonitorVideoRecordsQuery;
}
