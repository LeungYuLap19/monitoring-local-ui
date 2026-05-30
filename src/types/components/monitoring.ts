import { ActivityCount, ActivityClip, CameraFeed, StatByTime } from '../constants/domain';
import { PetMonitorCameraSnapshot } from '../lib/monitoring';

export type FilterCategory = 'all' | 'active' | 'eat' | 'drink';

export interface PetSelectorProps {
  selectedPetId: string;
  setSelectedPetId: (id: string) => void;
  cameraFeeds: CameraFeed[];
  onLinkPet?: () => void;
}

export interface PetProfileCardProps {
  activeFeed: CameraFeed;
  snapshot?: PetMonitorCameraSnapshot | null;
  onOpenClipsModal: () => void;
}

export interface LiveStreamViewProps {
  activeFeed: CameraFeed;
  streamActive: boolean;
  setStreamActive: (active: boolean) => void;
  streamUrl?: string | null;
  camId?: number | null;
  statusText?: string | null;
  placeholder?: {
    title: string;
    message: string;
  } | null;
}

export interface BehaviorStatsProps {
  timeFilter: '1' | '3' | '7';
  setTimeFilter: (value: '1' | '3' | '7') => void;
  summary: string;
  avgOver3Days: number;
  statsByTime: StatByTime[];
  trendStatsByTime: StatByTime[];
  activeCategory: ActivityCount[];
  totalActivities: number;
  onGenerateLog: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  error?: Error | null;
  placeholder?: {
    title: string;
    message: string;
  } | null;
}

export interface ClipSelectorModalProps {
  petName: string;
  onClose: () => void;
  clips?: ActivityClip[];
  getVideoUrl?: (clip: ActivityClip) => string | null;
}

export interface ActivityLogPreviewModalProps {
  petId: string;
  onClose: () => void;
  onSendSuccess: (logId: string) => void;
}
