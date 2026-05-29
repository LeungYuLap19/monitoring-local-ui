export interface BehaviorSSEEvent {
  cam_id: number;
  track_id: string;
  behavior: string;
  confidence: number;
}

export interface CameraStatsSSEEvent {
  cam_id: number;
  fps: number;
  yoloMs: number;
  ruleMs: number;
  status: string;
  name: string;
  deviceId: string | null;
  isRecording: boolean;
  imgsz?: number;
}

export interface BehaviorSSEState {
  connected: boolean;
  behaviors: BehaviorSSEEvent[];
  cameraStats: Map<number, CameraStatsSSEEvent>;
  lastBehaviorUpdate: number | null;
  lastStatsUpdate: number | null;
}
