import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Database, WifiOff } from 'lucide-react';
import { useLayoutContext } from '../hooks/layout';
import { useCameraPetMap } from '../hooks/pet';
import { usePetMonitorDashboard, usePetMonitorRecords } from '../hooks/monitoring';
import { useTranslation } from '../lib/i18n';
import { getBehaviorSummary } from '../lib/services/behaviorHistoryService';
import { getPetMonitorRecordThumbnailUrl, getPetMonitorRecordVideoUrl } from '../lib/services/petMonitorService';
import LiveStreamView from '../components/pages/monitoring/LiveStreamView';
import {
  buildCameraFeedsFromSSE,
  getCameraIdFromMonitorId,
  toActivityCounts,
  toBehaviorSummary,
} from '../lib/utils/services/pet-monitor-ui';
import ActivityLogBanner from '../components/pages/client-view/ActivityLogBanner';
import ActivityLogHero from '../components/pages/client-view/ActivityLogHero';
import ActivityLogSummary from '../components/pages/client-view/ActivityLogSummary';
import ActivityLogStats from '../components/pages/client-view/ActivityLogStats';
import ActivityLogHealth from '../components/pages/client-view/ActivityLogHealth';
import ActivityLogClips from '../components/pages/client-view/ActivityLogClips';
import ActivityLogFeedback from '../components/pages/client-view/ActivityLogFeedback';

export default function ClientViewPage() {
  const { selectedPetId, setSelectedPetId } = useLayoutContext();
  const { t } = useTranslation();
  const monitor = usePetMonitorDashboard({ autoLoad: true });
  const {
    records: videoRecords,
    loadRecords,
  } = usePetMonitorRecords({ autoLoad: false });
  const { cameraPetMap } = useCameraPetMap();
  const [liked, setLiked] = useState(false);
  const [streamActive, setStreamActive] = useState(true);

  const cameraFeeds = useMemo(() => {
    const feeds = buildCameraFeedsFromSSE(
      monitor.sse.cameraStats,
      monitor.sse.behaviors,
      monitor.urls.getVideoFeedUrl,
    );

    return feeds
      .map((feed) => {
        const petInfo = feed.deviceId ? cameraPetMap[feed.deviceId] : undefined;
        if (!petInfo) return null;

        return {
          ...feed,
          petId: petInfo.petId,
          petName: petInfo.name,
          petBreed: petInfo.breed,
          petAnimal: petInfo.animal,
          petStatus: petInfo.status,
        };
      })
      .filter((feed): feed is NonNullable<typeof feed> => Boolean(feed));
  }, [
    cameraPetMap,
    monitor.sse.behaviors,
    monitor.sse.cameraStats,
    monitor.urls.getVideoFeedUrl,
  ]);

  const activeFeed = useMemo(() => {
    if (!cameraFeeds.length) return null;
    return cameraFeeds.find((feed) => feed.id === selectedPetId) ?? cameraFeeds[0];
  }, [cameraFeeds, selectedPetId]);

  const selectedCamId = useMemo(
    () => getCameraIdFromMonitorId(activeFeed?.id),
    [activeFeed?.id],
  );

  useEffect(() => {
    if (!cameraFeeds.length) return;
    if (cameraFeeds.some((feed) => feed.id === selectedPetId)) return;
    setSelectedPetId(cameraFeeds[0].id);
  }, [cameraFeeds, selectedPetId, setSelectedPetId]);

  useEffect(() => {
    if (selectedCamId === null) return;
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    void loadRecords({ cam_id: selectedCamId, date }).catch(() => undefined);
  }, [loadRecords, selectedCamId]);

  const todayRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    return { from: start.toISOString(), to: end.toISOString() };
  }, []);

  const linkedPetId = activeFeed?.petId ?? null;

  const { data: summaryData } = useQuery({
    queryKey: ['client-view-summary', linkedPetId, todayRange.from, todayRange.to],
    queryFn: () => getBehaviorSummary(linkedPetId!, todayRange.from, todayRange.to),
    enabled: Boolean(linkedPetId),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const activityCounts = useMemo(() => {
    const backendCounts = toActivityCounts({ success: true, stats: summaryData?.stats ?? {} }, null);
    if (backendCounts.length > 0) return backendCounts;

    if (!activeFeed?.currentBehavior) return [];
    return [{
      label: activeFeed.currentBehavior,
      value: 1,
      color: '#0d9488',
    }];
  }, [activeFeed?.currentBehavior, summaryData?.stats]);

  const totalActivities = useMemo(
    () => activityCounts.reduce((acc, curr) => acc + curr.value, 0),
    [activityCounts],
  );

  const summaryText = useMemo(() => {
    if (!activeFeed) {
      return t('monitoring.placeholders.noCameraSelectedSummary');
    }
    return toBehaviorSummary(activeFeed.petName || activeFeed.name, totalActivities, totalActivities > 0);
  }, [activeFeed, t, totalActivities]);

  const liveClips = useMemo(() => (
    videoRecords.slice(0, 4).map((record) => ({
      id: `${record.cam_id}-${record.id}`,
      timestamp: new Date(record.start_time).toLocaleString(),
      petName: activeFeed?.petName || activeFeed?.name || '',
      action: record.trigger_action || t('monitoring.behavior.active'),
      thumbnailUrl: getPetMonitorRecordThumbnailUrl(record.filename),
      videoUrl: getPetMonitorRecordVideoUrl(record.filename),
      isUrgent: /(abnormal|alert|incident|panic|fall)/i.test(record.trigger_action),
    }))
  ), [activeFeed?.name, activeFeed?.petName, t, videoRecords]);

  const livePlaceholder = useMemo(() => {
    if (!activeFeed) return null;
    if (!monitor.sse.connected && monitor.activeCameras.error) {
      return {
        title: t('monitoring.placeholders.failedToConnect'),
        message: t('monitoring.placeholders.failedToConnectMsg'),
      };
    }
    if (!activeFeed.streamUrl && !activeFeed.isLive) {
      return {
        title: t('monitoring.placeholders.noLiveStream'),
        message: t('monitoring.placeholders.noLiveStreamMsg'),
      };
    }
    return null;
  }, [activeFeed, monitor.activeCameras.error, monitor.sse.connected, t]);

  if (!activeFeed) {
    const hasConnectionError = !monitor.sse.connected && Boolean(monitor.activeCameras.error);
    return (
      <div id="page-client-view" className="p-4 sm:p-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm p-10 text-center space-y-4">
          {hasConnectionError ? (
            <WifiOff className="size-10 text-rose-500 mx-auto" />
          ) : (
            <Database className="size-10 text-slate-400 mx-auto" />
          )}
          <div className="space-y-1">
            <p className="text-base font-black text-slate-700">{t('monitoring.placeholders.noPetLinked')}</p>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">{t('monitoring.placeholders.noPetLinkedMsg')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="page-client-view" className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 sm:space-y-8 select-none animate-in fade-in slide-in-from-bottom-3 duration-300">
      <ActivityLogBanner petName={activeFeed.petName || activeFeed.name} />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-slate-400">{t('monitoring.currentlyWatching')}</p>
          <p className="text-sm font-black text-slate-700">{activeFeed.name}</p>
        </div>
        <div className="relative">
          <select
            id="client-view-pet-selector"
            value={activeFeed.id}
            onChange={(e) => setSelectedPetId(e.target.value)}
            className="appearance-none bg-slate-50 rounded-xl px-4 py-2 pr-8 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/10 cursor-pointer min-w-[220px]"
          >
            {cameraFeeds.map((feed) => (
              <option key={feed.id} value={feed.id}>
                {feed.petName || feed.name}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
        </div>
      </div>

      <div id="parent-letter-container" className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        <ActivityLogHero petName={activeFeed.petName || activeFeed.name} />
        <div id="letter-sheet-body" className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          <LiveStreamView
            activeFeed={activeFeed}
            streamActive={streamActive}
            setStreamActive={setStreamActive}
            streamUrl={activeFeed.streamUrl}
            camId={selectedCamId}
            statusText={activeFeed.vibeText ?? null}
            placeholder={livePlaceholder}
          />
          <ActivityLogSummary summaryText={summaryText} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            <ActivityLogStats activityCounts={activityCounts} />
            <ActivityLogHealth
              statusText={activeFeed.isOnline ? t('clientView.healthStatusLive') : t('clientView.healthStatusOffline')}
              statusTone={activeFeed.isOnline ? 'ok' : 'warn'}
              cameraName={activeFeed.name}
              streamStatus={activeFeed.isLive ? t('clientView.healthStreamLive') : t('clientView.healthStreamOffline')}
              behaviorStatus={activeFeed.currentBehavior || t('monitoring.placeholders.loadingTelemetry')}
              telemetryStatus={activeFeed.vibeText || t('monitoring.placeholders.loadingTelemetry')}
            />
          </div>
          <ActivityLogClips clips={liveClips} />
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 mt-4 text-xs font-medium text-slate-500 leading-normal">
            <span className="block font-bold text-slate-700 mb-0.5">{t('clientView.tipTitle')}</span>
            {t('clientView.tipContent')}
          </div>
        </div>
        <ActivityLogFeedback
          liked={liked}
          onToggleLike={() => setLiked(!liked)}
        />
      </div>
    </div>
  );
}
