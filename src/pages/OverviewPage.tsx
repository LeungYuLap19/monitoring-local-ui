import { useState, useMemo } from 'react';
import { useLayoutContext } from '../hooks/layout';
import { useCameraPetMap } from '../hooks/pet';
import { usePetMonitorDashboard } from '../hooks/monitoring';
import { getCurrentSessionUser } from '../lib/services/authService';
import { buildCameraFeedsFromSSE } from '../lib/utils/services/pet-monitor-ui';
import MetricsGrid from '../components/pages/overview/MetricsGrid';
import MonitoringHeader from '../components/pages/overview/MonitoringHeader';
import CameraFeedGrid from '../components/pages/overview/CameraFeedGrid';

export default function OverviewPage() {
  const { onSelectCamera, onOpenXiaomiLogin, xiaomiConnected } = useLayoutContext();
  const { cameraPetMap } = useCameraPetMap();
  const currentUser = getCurrentSessionUser();
  const isNgo = currentUser?.role === 'ngo';
  const monitor = usePetMonitorDashboard({
    autoLoad: true,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'online' | 'offline' | 'resting' | 'active'>('all');

  const cameraFeeds = useMemo(() => {
    const feeds = buildCameraFeedsFromSSE(
      monitor.sse.cameraStats,
      monitor.sse.behaviors,
      monitor.urls.getVideoFeedUrl,
    );
    return feeds.map((feed) => {
      const petInfo = feed.deviceId ? cameraPetMap[feed.deviceId] : undefined;
      if (petInfo) {
        return { ...feed, petName: petInfo.name, petId: petInfo.petId };
      }
      return feed;
    });
  }, [
    cameraPetMap,
    monitor.sse.cameraStats,
    monitor.sse.behaviors,
    monitor.urls.getVideoFeedUrl,
  ]);

  const filteredFeeds = useMemo(() => {
    return cameraFeeds.filter(feed => {
      const matchesSearch = feed.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (feed.petName && feed.petName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFilter =
        filterType === 'all' ? true :
        filterType === 'online' ? feed.isOnline :
        filterType === 'offline' ? !feed.isOnline :
        filterType === 'resting' ? feed.currentBehavior === '休息' :
        filterType === 'active' ? feed.currentBehavior === '活動' || feed.currentBehavior === '放風中' : true;
      return matchesSearch && matchesFilter;
    });
  }, [cameraFeeds, searchQuery, filterType]);

  const onlineCameraCount = useMemo(
    () => cameraFeeds.filter((feed) => feed.isOnline).length,
    [cameraFeeds],
  );

  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
  };

  return (
    <div id="page-overview" className="p-4 md:p-8 space-y-6 md:space-y-8 select-none animate-in fade-in slide-in-from-bottom-3 duration-300">
      {isNgo && (
        <MetricsGrid
          onlineCameras={onlineCameraCount}
          totalCameras={cameraFeeds.length}
          alertsToday={0}
          isLoading={monitor.isLoading}
        />
      )}
      <section id="monitoring-grid-container" className="space-y-6">
        <MonitoringHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterType={filterType}
          onFilterChange={setFilterType}
          onClearFilters={clearFilters}
          onReconnect={() => {
            void monitor.reconnectDashboard().catch(() => undefined);
          }}
          reconnectDisabled={monitor.isLoading}
          xiaomiConnected={xiaomiConnected}
          onOpenXiaomiLogin={onOpenXiaomiLogin}
        />
        <CameraFeedGrid
          feeds={filteredFeeds}
          onSelectCamera={onSelectCamera}
          onClearFilters={clearFilters}
          isBlocked={monitor.isBlocked}
          onReconnect={() => {
            void monitor.reconnectDashboard().catch(() => undefined);
          }}
        />
      </section>
    </div>
  );
}
