import { CameraFeed } from '../constants/domain';

export interface MetricsGridProps {
  onlineCameras?: number;
  totalCameras?: number;
  alertsToday?: number;
  isLoading?: boolean;
}

export interface MonitoringHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterType: 'all' | 'online' | 'offline' | 'resting' | 'active';
  onFilterChange: (value: 'all' | 'online' | 'offline' | 'resting' | 'active') => void;
  onClearFilters: () => void;
  onReconnect?: () => void;
  reconnectDisabled?: boolean;
  xiaomiConnected?: boolean;
  onOpenXiaomiLogin?: () => void;
}

export interface CameraFeedGridProps {
  feeds: CameraFeed[];
  onSelectCamera: (camId: string) => void;
  onClearFilters: () => void;
  isBlocked?: boolean;
  onReconnect?: () => void;
}

export interface CameraCardProps {
  feed: CameraFeed;
  onSelectCamera: (camId: string) => void;
}
