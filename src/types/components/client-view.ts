import { ActivityClip, ActivityCount } from '../constants/domain';

export interface ActivityLogBannerProps {
  petName: string;
}

export interface ActivityLogHeroProps {
  petName: string;
}

export interface ActivityLogSummaryProps {
  summaryText: string;
}

export interface ActivityLogStatsProps {
  activityCounts: ActivityCount[];
}

export interface ActivityLogHealthProps {
  statusText: string;
  statusTone?: 'ok' | 'warn';
  cameraName: string;
  streamStatus: string;
  behaviorStatus: string;
  telemetryStatus: string;
}

export interface ActivityLogClipsProps {
  clips: ActivityClip[];
}

export interface ActivityLogFeedbackProps {
  liked: boolean;
  onToggleLike: () => void;
}
