export type PetMonitorCameraIndex = number;
export type PetMonitorRecordCameraId = number;
export type PetMonitorStreamSubtype = 'hd' | 'sd';
export type PetMonitorBehaviorTimelineBucket = '5m' | '1h' | '1d';


export interface PetMonitorTrackState {
  id: number;
  time: string;
  bowl: string;
  probs: Record<string, number>;
  state?: string;
}

export interface PetMonitorCameraStats {
  fps: number;
  yoloMs: number;
  ruleMs: number;
  actionMs: number;
  decodeMs: number;
  status: string;
  camId: PetMonitorCameraIndex;
  deviceId?: string | null;
  imgsz?: number;
  isRecording?: boolean;
  name?: string;
  yoloFpsMode?: string;
  yoloTargetIntervalMs?: number;
  yoloSkipped?: boolean;
}

export interface PetMonitorCameraSnapshot {
  stats: PetMonitorCameraStats;
  logs: PetMonitorTrackState[];
  active_states: Record<string, PetMonitorTrackState>;
}

export interface PetMonitorBackendStatsResponse {
  [cameraKey: string]: PetMonitorCameraSnapshot;
}

export interface PetMonitorXiaomiCamera {
  name: string;
  url?: string;
  did?: string;
  model?: string;
  host?: string;
  raw?: unknown;
}

export interface Go2rtcXiaomiSource {
  name: string;
  info: string;
  url: string;
  did?: string;
}

export interface PetMonitorSelectedCamera extends PetMonitorXiaomiCamera {
  url: string;
  subtype?: PetMonitorStreamSubtype;
}

export interface PetMonitorSetupStatus {
  setup_complete: boolean;
  stream_runtime_running: boolean;
  stream_name: string;
  stream_url: string;
  selected_camera?: PetMonitorSelectedCamera | null;
  account_id?: string | null;
  region?: string | null;
  has_xiaomi_token: boolean;
}


export interface PetMonitorActiveCamerasResponse {
  active_cams: PetMonitorCameraIndex[];
  success?: boolean;
}

export interface PetMonitorCameraRuntimeConfig {
  imgsz: number;
  record_labels: string[];
  record_threshold: number;
  yolo_fps_mode: string;
  name: string;
}

export interface PetMonitorCameraRuntimeConfigUpdate {
  imgsz?: number;
  record_labels?: string[];
  record_threshold?: number;
  yolo_fps_mode?: string;
  name?: string;
}

export interface PetMonitorCameraConfigUpdateResponse {
  success: boolean;
  config?: PetMonitorCameraRuntimeConfig;
  error?: string;
}

export interface PetMonitorBehaviorLogsQuery {
  cam_id: PetMonitorCameraIndex;
  start?: string;
  end?: string;
}

export interface PetMonitorBehaviorLogStatsResponse {
  success: boolean;
  stats: Record<string, number>;
  error?: string;
}

export interface PetMonitorBehaviorTimelinePoint {
  label: string;
  counts: Record<string, number>;
}

export interface PetMonitorBehaviorTimelineQuery extends PetMonitorBehaviorLogsQuery {
  bucket: PetMonitorBehaviorTimelineBucket;
}

export interface PetMonitorBehaviorTimelineResponse {
  success: boolean;
  cam_id: PetMonitorCameraIndex;
  bucket: PetMonitorBehaviorTimelineBucket;
  points: PetMonitorBehaviorTimelinePoint[];
  error?: string;
}

export interface PetMonitorVideoRecord {
  id: number;
  cam_id: PetMonitorRecordCameraId;
  filename: string;
  start_time: string;
  end_time: string;
  trigger_action: string;
  max_confidence: number;
}

export interface PetMonitorVideoRecordsQuery {
  cam_id?: string | number;
  action?: string;
  date?: string;
}

export interface PetMonitorVideoRecordsResponse {
  success: boolean;
  records: PetMonitorVideoRecord[];
  error?: string;
}

export interface PetMonitorDeleteVideoRecordResponse {
  success: boolean;
  error?: string;
}

export interface AwsBehaviorSummaryResponse {
  petId: string;
  from: string;
  to: string;
  stats: Record<string, number>;
}

export interface AwsBehaviorTimelinePoint {
  label: string;
  counts: Record<string, number>;
}

export interface AwsBehaviorTimelineResponse {
  petId: string;
  bucket: '5m' | '1h' | '1d';
  points: AwsBehaviorTimelinePoint[];
}

export interface AwsBehaviorEvent {
  timestamp: string;
  did: string;
  behavior: string;
  behaviors: string[];
  petId: string;
}

export interface AwsBehaviorEventsResponse {
  data: AwsBehaviorEvent[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
