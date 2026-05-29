import type {
  ActivityClip,
  ActivityCount,
  PetGuest,
  CameraFeed,
  StatByTime,
} from '../../../types/constants/domain';
import type {
  PetMonitorBehaviorLogStatsResponse,
  PetMonitorBehaviorTimelineResponse,
  PetMonitorCameraIndex,
  PetMonitorCameraSnapshot,
  PetMonitorVideoRecord,
} from '../../../types/lib/monitoring';
import type { BehaviorSSEEvent, CameraStatsSSEEvent } from '../../../types/lib/behaviorSSE';

export interface PetMonitorCameraSnapshotItem {
  cameraKey: string;
  camId: PetMonitorCameraIndex | null;
  snapshot: PetMonitorCameraSnapshot;
}

const BEHAVIOR_COLORS: Record<string, string> = {
  resting: '#94a3b8',
  rest: '#94a3b8',
  sleep: '#94a3b8',
  sleeping: '#94a3b8',
  active: '#f97316',
  activity: '#f97316',
  moving: '#f97316',
  eating: '#0d9488',
  eat: '#0d9488',
  drinking: '#06b6d4',
  drink: '#06b6d4',
  abnormal: '#e11d48',
};

const BEHAVIOR_LABELS: Record<string, string> = {
  resting: 'monitoring.behavior.resting',
  rest: 'monitoring.behavior.resting',
  sleep: 'monitoring.behavior.resting',
  sleeping: 'monitoring.behavior.resting',
  active: 'monitoring.behavior.active',
  activity: 'monitoring.behavior.active',
  moving: 'monitoring.behavior.active',
  eating: 'monitoring.behavior.eating',
  eat: 'monitoring.behavior.eating',
  drinking: 'monitoring.behavior.drinking',
  drink: 'monitoring.behavior.drinking',
};

function normalizeBehaviorKey(value?: string | null): string {
  return (value ?? '').trim().toLowerCase().replace(/\s+/g, '_');
}

function toTimelineBehaviorCounts(counts: Record<string, number>): Record<string, number> {
  return Object.entries(counts).reduce<Record<string, number>>((acc, [rawLabel, rawCount]) => {
    const count = Number.isFinite(rawCount) ? rawCount : 0;

    rawLabel.split(',').forEach((label) => {
      const key = normalizeBehaviorKey(label);
      const normalizedKey =
        ['active', 'activity', 'moving'].includes(key) ? 'moving' :
        ['rest', 'sleep', 'sleeping'].includes(key) ? 'resting' :
        key;

      if (normalizedKey) {
        acc[normalizedKey] = (acc[normalizedKey] ?? 0) + count;
      }
    });

    return acc;
  }, {});
}

function toDisplayBehavior(value?: string | null): string {
  const key = normalizeBehaviorKey(value);
  if (!key) return '監測中';
  if (['resting', 'rest', 'sleep', 'sleeping'].includes(key)) return '休息';
  if (['eating', 'eat'].includes(key)) return '吃飯';
  if (['drinking', 'drink'].includes(key)) return '喝水';
  if (['active', 'activity', 'moving'].includes(key)) return '活動';
  return value ?? key;
}

function toBehaviorLabel(value: string): string {
  const key = normalizeBehaviorKey(value);
  return BEHAVIOR_LABELS[key] ?? value;
}

function toBehaviorColor(value: string, index: number): string {
  const key = normalizeBehaviorKey(value);
  const fallbackColors = ['#0d9488', '#f97316', '#06b6d4', '#94a3b8', '#e11d48'];
  return BEHAVIOR_COLORS[key] ?? fallbackColors[index % fallbackColors.length];
}

function formatCameraId(camId: PetMonitorCameraIndex | null, fallback: string): string {
  return camId === null ? fallback : `cam-${camId}`;
}

function formatCameraName(camId: PetMonitorCameraIndex | null, snapshot?: PetMonitorCameraSnapshot): string {
  return snapshot?.stats.name?.trim() || (camId === null ? 'Pet monitor camera' : `Camera ${camId}`);
}

function getSnapshotBehavior(snapshot: PetMonitorCameraSnapshot): string {
  const activeState = Object.values(snapshot.active_states ?? {})[0];
  return toDisplayBehavior(activeState?.state ?? activeState?.bowl ?? snapshot.logs?.[0]?.state ?? snapshot.stats.status);
}

function getStatusText(snapshot: PetMonitorCameraSnapshot): string {
  const { fps, yoloMs, ruleMs, isRecording } = snapshot.stats;
  const fpsText = Number.isFinite(fps) ? `${fps.toFixed(1)} fps` : 'stream online';
  const yoloText = Number.isFinite(yoloMs) ? `AI ${Math.round(yoloMs)}ms` : 'AI ready';
  const ruleText = Number.isFinite(ruleMs) ? `rules ${Math.round(ruleMs)}ms` : '';
  return [fpsText, yoloText, ruleText, isRecording ? 'recording' : null].filter(Boolean).join(' · ');
}

export function getCameraIdFromMonitorId(id?: string | null): PetMonitorCameraIndex | null {
  const match = id?.match(/\d+/);
  if (!match) return null;
  const camId = Number(match[0]);
  return Number.isFinite(camId) ? camId : null;
}

export function toPetMonitorCameraFeeds(
  snapshots: PetMonitorCameraSnapshotItem[],
  activeCameras: PetMonitorCameraIndex[] = [],
  _unused?: unknown,
  getVideoFeedUrl?: (camId: PetMonitorCameraIndex) => string,
): CameraFeed[] {
  return snapshots.map(({ cameraKey, camId, snapshot }) => {
    const isActive = camId === null ? true : activeCameras.length === 0 || activeCameras.includes(camId);
    const status = normalizeBehaviorKey(snapshot.stats.status);
    const isOnline = isActive && status !== 'offline' && status !== 'error';

    return {
      id: formatCameraId(camId, cameraKey),
      name: formatCameraName(camId, snapshot),
      isOnline,
      currentBehavior: getSnapshotBehavior(snapshot),
      petId: formatCameraId(camId, cameraKey),
      petName: formatCameraName(camId, snapshot),
      isLive: isOnline,
      vibeText: getStatusText(snapshot),
      streamUrl: camId === null ? undefined : getVideoFeedUrl?.(camId),
      camId,
      deviceId: snapshot.stats.deviceId ?? null,
    };
  });
}

export function buildCameraFeedsFromSSE(
  cameraStats: Map<number, CameraStatsSSEEvent>,
  behaviors: BehaviorSSEEvent[],
  getVideoFeedUrl?: (camId: number) => string,
): CameraFeed[] {
  const behaviorByCam = new Map<number, BehaviorSSEEvent>();
  for (const evt of behaviors) {
    if (!behaviorByCam.has(evt.cam_id)) {
      behaviorByCam.set(evt.cam_id, evt);
    }
  }

  return [...cameraStats.entries()]
    .sort(([a], [b]) => a - b)
    .map(([camId, stats]) => {
      const status = normalizeBehaviorKey(stats.status);
      const isOnline = status !== 'offline' && status !== 'error';
      const behaviorEvt = behaviorByCam.get(camId);
      const currentBehavior = behaviorEvt
        ? toDisplayBehavior(behaviorEvt.behavior)
        : (isOnline ? '監測中' : '離線');

      const fpsText = `${stats.fps.toFixed(1)} fps`;
      const yoloText = `AI ${stats.yoloMs}ms`;
      const vibeText = [fpsText, yoloText, stats.isRecording ? 'recording' : null].filter(Boolean).join(' · ');

      return {
        id: `cam-${camId}`,
        name: stats.name || `Camera ${camId}`,
        isOnline,
        currentBehavior,
        petId: `cam-${camId}`,
        petName: stats.name || `Camera ${camId}`,
        isLive: isOnline,
        vibeText,
        streamUrl: getVideoFeedUrl?.(camId),
        camId,
        deviceId: stats.deviceId,
      };
    });
}

export function toPetMonitorGuests(
  feeds: CameraFeed[],
  fallbackGuests: PetGuest[],
): PetGuest[] {
  if (!feeds.length) return fallbackGuests;

  return feeds.map((feed, index) => {
    const fallback = fallbackGuests[index % fallbackGuests.length];
    return {
      ...fallback,
      id: feed.id,
      name: feed.petName || feed.name,
      breed: 'Pet monitor stream',
      checkInDate: 'Live monitoring',
      checkOutDate: 'Active',
      currentBehavior: feed.currentBehavior,
      humidity: fallback?.humidity ?? 60,
      temperature: fallback?.temperature ?? 25,
      notes: feed.isOnline ? 'Backend stream is connected and AI detection is running.' : 'Camera is offline or inactive.',
      extraServices: feed.vibeText || 'PetMonitor backend telemetry',
      status: feed.isOnline ? '監測中' : '離線',
    };
  });
}

export function toActivityCounts(
  behaviorStats?: PetMonitorBehaviorLogStatsResponse | null,
  snapshot?: PetMonitorCameraSnapshot | null,
): ActivityCount[] {
  const rawStats = behaviorStats?.stats && Object.keys(behaviorStats.stats).length
    ? behaviorStats.stats
    : Object.entries(snapshot?.active_states ?? {}).reduce<Record<string, number>>((acc, [key, state]) => {
      const label = state.state || state.bowl || key;
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {});

  return Object.entries(rawStats).map(([label, value], index) => ({
    label: toBehaviorLabel(label),
    value: Number.isFinite(value) ? value : 0,
    color: toBehaviorColor(label, index),
  }));
}

export function toStatsByTime(
  timeline?: PetMonitorBehaviorTimelineResponse | null,
  activityCounts: ActivityCount[] = [],
): StatByTime[] {
  if (timeline?.points?.length) {
    return timeline.points.map((point) => {
      const counts = toTimelineBehaviorCounts(point.counts ?? {});
      const activityCount = counts.moving ?? 0;
      const label = point.label.includes('T')
        ? String(new Date(point.label + ':00Z').getHours())
        : point.label.slice(5);

      return {
        date: label,
        activityCount,
        restingCount: counts.resting ?? 0,
        eatingCount: counts.eating ?? counts.eat ?? 0,
        drinkingCount: counts.drinking ?? counts.drink ?? 0,
        averageOver3Days: activityCount,
      };
    });
  }

  const activityCount = activityCounts.reduce((sum, item) => sum + item.value, 0);
  return [
    { date: 'Previous', activityCount: 0, restingCount: 0, eatingCount: 0, drinkingCount: 0, averageOver3Days: activityCount },
    { date: 'Recent', activityCount, restingCount: 0, eatingCount: 0, drinkingCount: 0, averageOver3Days: activityCount },
    { date: 'Now', activityCount, restingCount: 0, eatingCount: 0, drinkingCount: 0, averageOver3Days: activityCount },
  ];
}

export function formatBehaviorDuration(seconds: number): string {
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  if (seconds >= 60) {
    return `${Math.round(seconds / 60)} min`;
  }
  return `${seconds}s`;
}

export function toBehaviorSummary(cameraName: string, totalActivities: number, hasBackendData: boolean): string {
  if (!hasBackendData) {
    return `${cameraName} is waiting for behavior history from the PetMonitor backend.`;
  }

  return `${cameraName} has ${formatBehaviorDuration(totalActivities)} of behavior data in the selected monitoring window.`;
}

export function toActivityClips(
  records: PetMonitorVideoRecord[],
  getThumbnailUrl: (filename: string) => string,
): ActivityClip[] {
  return records.map((record) => ({
    id: String(record.id),
    timestamp: record.start_time,
    petName: `Camera ${record.cam_id}`,
    action: record.trigger_action,
    thumbnailUrl: getThumbnailUrl(record.filename),
    videoUrl: record.filename,
    isUrgent: normalizeBehaviorKey(record.trigger_action).includes('abnormal'),
  }));
}
