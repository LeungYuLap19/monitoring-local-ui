import { useEffect, useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Database, WifiOff, Settings2 } from 'lucide-react';
import { useLayoutContext } from '../hooks/layout';
import { useTranslation } from '../lib/i18n';
import { useCameraPetMap } from '../hooks/pet';
import { useUpdatePetProfile } from '../hooks/pet/useUpdatePetProfile';
import {
  usePetMonitorCameraConfig,
  usePetMonitorDashboard,
  usePetMonitorRecords,
} from '../hooks/monitoring';
import {
  buildCameraFeedsFromSSE,
  getCameraIdFromMonitorId,
  toActivityCounts,
  toBehaviorSummary,
  toStatsByTime,
} from '../lib/utils/services/pet-monitor-ui';
import { getBehaviorSummary, getBehaviorTimeline } from '../lib/services/behaviorHistoryService';
import { getMonitoringSettings, patchMonitoringSettings } from '../lib/services/subscriptionService';
import { syncMonitoringModels, getMonitoringSettingsLocal, setPetMonitorActiveCameras, PET_MONITOR_API_BASE_URL } from '../lib/services/petMonitorService';
import { getRoleFromToken } from '../lib/utils/auth';
import PetSelector from '../components/pages/monitoring/PetSelector';
import PetProfileCard from '../components/pages/monitoring/PetProfileCard';
import LiveStreamView from '../components/pages/monitoring/LiveStreamView';
import BehaviorStats from '../components/pages/monitoring/BehaviorStats';
import LinkPetModal from '../components/pages/monitoring/LinkPetModal';
import ModelSelectorModal from '../components/pages/monitoring/ModelSelectorModal';
import { Button } from '../components/ui/button';

function MonitoringPlaceholder({
  icon,
  title,
  message,
  onReconnect,
  reconnectDisabled = false,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  onReconnect?: () => void;
  reconnectDisabled?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-dashed border-slate-200 p-8 text-center space-y-3">
      <div className="flex justify-center">{icon}</div>
      <div className="space-y-1">
        <p className="text-sm font-extrabold text-slate-700">{title}</p>
        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">{message}</p>
      </div>
      {onReconnect ? (
        <div className="pt-2">
          <Button variant="outline" onClick={onReconnect} disabled={reconnectDisabled}>
            Reconnect
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default function MonitoringPage() {
  const { selectedPetId, setSelectedPetId, onOpenClipsModal } = useLayoutContext();
  const { t } = useTranslation();
  const [timeFilter, setTimeFilter] = useState<'1' | '3' | '7'>('3');
  const [streamActive, setStreamActive] = useState(true);
  const monitor = usePetMonitorDashboard({
    autoLoad: true,
  });
  const records = usePetMonitorRecords({ autoLoad: false });
  const cameraConfig = usePetMonitorCameraConfig({ autoLoad: false });
  const { cameraPetMap } = useCameraPetMap();
  const { updatePetProfile, isSubmitting: isLinkingPet } = useUpdatePetProfile();
  const [showLinkPetModal, setShowLinkPetModal] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [currentModelKeys, setCurrentModelKeys] = useState<string[]>([]);
  const [aiModelLimit, setAiModelLimit] = useState(1);
  const [pendingPetAnimal, setPendingPetAnimal] = useState<string | null | undefined>(undefined);
  const { loadRecords } = records;
  const { loadCameraConfig } = cameraConfig;

  const cameraFeeds = useMemo(() => {
    const feeds = buildCameraFeedsFromSSE(
      monitor.sse.cameraStats,
      monitor.sse.behaviors,
      monitor.urls.getVideoFeedUrl,
    );
    return feeds.map((feed) => {
      const petInfo = feed.deviceId ? cameraPetMap[feed.deviceId] : undefined;
      if (petInfo) {
        return {
          ...feed,
          petName: petInfo.name,
          petId: petInfo.petId,
          petBreed: petInfo.breed,
          petAnimal: petInfo.animal,
          petStatus: petInfo.status,
        };
      }
      return feed;
    });
  }, [
    cameraPetMap,
    monitor.sse.cameraStats,
    monitor.sse.behaviors,
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

  const selectedCameraStats = useMemo(() => {
    if (selectedCamId === null) return null;
    return monitor.sse.getStatsForCam(selectedCamId);
  }, [monitor.sse, selectedCamId]);

  const hasMonitorError = Boolean(!monitor.sse.connected && monitor.activeCameras.error);
  const hasFeeds = cameraFeeds.length > 0;
  const hasCameraSelection = activeFeed !== null;

  useEffect(() => {
    if (!cameraFeeds.length) return;
    if (cameraFeeds.some((feed) => feed.id === selectedPetId)) return;
    setSelectedPetId(cameraFeeds[0].id);
  }, [cameraFeeds, selectedPetId, setSelectedPetId]);

  useEffect(() => {
    if (selectedCamId === null) return;
    void loadRecords({ cam_id: selectedCamId }).catch(() => undefined);
    void loadCameraConfig(selectedCamId).catch(() => undefined);
  }, [loadCameraConfig, loadRecords, selectedCamId]);

  useEffect(() => {
    getMonitoringSettingsLocal()
      .then((local) => {
        const profiles = Object.values(local.cameras).map((c) => c.animal_profile);
        const unique = [...new Set(profiles.filter(Boolean))];
        if (unique.length > 0) setCurrentModelKeys(unique);
      })
      .catch(() => {});

    const role = getRoleFromToken();
    if (role && role !== 'user') {
      setAiModelLimit(99);
    } else {
      getMonitoringSettings()
        .then((settings) => {
          const entitlement = settings.entitlement;
          setAiModelLimit(entitlement?.aiModelSelectionLimit ?? 1);
          syncMonitoringModels(
            settings.selectedAiModelKeys ?? [],
            { cameraLimit: entitlement?.cameraLimit, aiModelSelectionLimit: entitlement?.aiModelSelectionLimit },
          ).catch(() => {});
        })
        .catch(() => {});
    }
  }, []);

  const handleModelSave = useCallback(async (selectedKeys: string[]) => {
    const role = getRoleFromToken();
    let limits: { cameraLimit?: number; aiModelSelectionLimit?: number } | undefined;

    const awsPromise = role === 'user'
      ? getMonitoringSettings()
          .then((settings) => {
            limits = {
              cameraLimit: settings?.entitlement?.cameraLimit,
              aiModelSelectionLimit: settings?.entitlement?.aiModelSelectionLimit,
            };
            return patchMonitoringSettings({
              selectedCameraIds: settings?.selectedCameraIds ?? [],
              selectedAiModelKeys: selectedKeys,
            });
          })
          .catch(() => {})
      : Promise.resolve();

    await awsPromise;

    const syncResult = await syncMonitoringModels(selectedKeys, limits);

    if (syncResult.success) {
      setCurrentModelKeys(selectedKeys);
      await setPetMonitorActiveCameras([]);
      await new Promise((r) => setTimeout(r, 1500));
      await fetch(`${PET_MONITOR_API_BASE_URL}/api/reload_streams`, { method: 'POST' });
    }
  }, []);

  const linkedPetId = useMemo(() => {
    const id = activeFeed?.petId;
    if (!id || id.startsWith('cam-')) return null;
    return id;
  }, [activeFeed?.petId]);

  const activeDeviceId = activeFeed?.deviceId ?? null;

  const handleLinkPet = useCallback((petId: string, petAnimal?: string | null) => {
    if (!activeDeviceId) return;
    updatePetProfile({ monitorCameraId: activeDeviceId }, { petId })
      .then(() => {
        setShowLinkPetModal(false);
        setPendingPetAnimal(petAnimal);
        setShowModelSelector(true);
      })
      .catch((err: any) => {
        const status = err?.status ?? err?.response?.status ?? 0;
        if (status === 409) {
          toast.error(t('monitoring.linkPet.conflictError'));
        } else {
          toast.error(err?.message ?? 'Failed to link pet');
        }
      });
  }, [activeDeviceId, updatePetProfile, t]);

  const handleUnlinkPet = useCallback((petId: string) => {
    void updatePetProfile({ monitorCameraId: null }, { petId });
  }, [updatePetProfile]);

  const dateRange = useMemo(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const toDateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (timeFilter === '1') {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setDate(now.getDate() + 1);
      end.setHours(0, 0, 0, 0);
      return { from: start.toISOString(), to: end.toISOString() };
    }

    const start = new Date(now);
    start.setDate(now.getDate() - (Number(timeFilter) - 1));
    return { from: toDateStr(start), to: toDateStr(now) };
  }, [timeFilter]);

  const todayDateRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setDate(now.getDate() + 1);
    end.setHours(0, 0, 0, 0);
    return { from: start.toISOString(), to: end.toISOString() };
  }, []);

  const { data: awsSummary, isLoading: isSummaryLoading, refetch: refetchSummary } = useQuery({
    queryKey: ['behavior-summary', linkedPetId, dateRange.from, dateRange.to],
    queryFn: () => getBehaviorSummary(linkedPetId!, dateRange.from, dateRange.to),
    enabled: !!linkedPetId,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const { data: awsTodaySummary, isLoading: isTodaySummaryLoading, refetch: refetchTodaySummary } = useQuery({
    queryKey: ['behavior-summary-today', linkedPetId, todayDateRange.from, todayDateRange.to],
    queryFn: () => getBehaviorSummary(linkedPetId!, todayDateRange.from, todayDateRange.to),
    enabled: !!linkedPetId,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const { data: awsTimeline, isLoading: isTimelineLoading, refetch: refetchTimeline } = useQuery({
    queryKey: ['behavior-timeline', linkedPetId, dateRange.from, dateRange.to, timeFilter],
    queryFn: () => getBehaviorTimeline(linkedPetId!, dateRange.from, dateRange.to, timeFilter === '1' ? '1h' : '1d'),
    enabled: !!linkedPetId,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const refreshBehaviorData = () => {
    void refetchSummary();
    void refetchTodaySummary();
    void refetchTimeline();
  };

  const backendActivityCounts = useMemo(
    () => toActivityCounts({ success: true, stats: awsSummary?.stats ?? {} }, null),
    [awsSummary?.stats],
  );
  const todayActivityCounts = useMemo(
    () => toActivityCounts({ success: true, stats: awsTodaySummary?.stats ?? {} }, null),
    [awsTodaySummary?.stats],
  );
  const hasBehaviorStatsData = useMemo(
    () => Object.keys(awsSummary?.stats ?? {}).length > 0,
    [awsSummary?.stats],
  );
  const hasTimelineData = useMemo(
    () => (awsTimeline?.points?.length ?? 0) > 0,
    [awsTimeline?.points],
  );
  const statsByTime = useMemo(
    () => {
      if (hasTimelineData && awsTimeline) {
        const asLocal = { success: true, cam_id: selectedCamId ?? 0, bucket: awsTimeline.bucket, points: awsTimeline.points };
        return toStatsByTime(asLocal, backendActivityCounts);
      }
      if (hasBehaviorStatsData) {
        return toStatsByTime(null, backendActivityCounts);
      }
      return [];
    },
    [awsTimeline, backendActivityCounts, hasBehaviorStatsData, hasTimelineData, selectedCamId],
  );
  const trendStatsByTime = useMemo(
    () => {
      if (!awsTimeline?.points?.length) return [];
      const asLocal = { success: true, cam_id: selectedCamId ?? 0, bucket: awsTimeline.bucket, points: awsTimeline.points };
      return toStatsByTime(asLocal, []);
    },
    [awsTimeline, selectedCamId],
  );
  const totalActivities = useMemo(
    () => backendActivityCounts.reduce((acc, curr) => acc + curr.value, 0),
    [backendActivityCounts],
  );
  const isBehaviorLoading = isSummaryLoading || isTodaySummaryLoading || isTimelineLoading;
  const avgOver3Days = useMemo(() => {
    if (!statsByTime.length) return 0;
    const total = statsByTime.reduce((sum, item) => sum + item.activityCount, 0);
    return Math.round(total / statsByTime.length);
  }, [statsByTime]);
  const behaviorSummary = useMemo(() => {
    if (!activeFeed) return t('monitoring.placeholders.noCameraSelectedSummary');
    return toBehaviorSummary(activeFeed.petName || activeFeed.name, totalActivities, totalActivities > 0 || statsByTime.length > 0);
  }, [activeFeed, statsByTime.length, t, totalActivities]);

  const livePlaceholder = useMemo(() => {
    if (hasMonitorError) {
      return {
        title: t('monitoring.placeholders.failedToConnect'),
        message: t('monitoring.placeholders.failedToConnectMsg'),
      };
    }
    if (!hasCameraSelection) {
      return {
        title: t('monitoring.placeholders.noCameraData'),
        message: t('monitoring.placeholders.noCameraDataMsg'),
      };
    }
    if (!activeFeed?.streamUrl && !activeFeed?.isLive) {
      return {
        title: t('monitoring.placeholders.noLiveStream'),
        message: t('monitoring.placeholders.noLiveStreamMsg'),
      };
    }
    return null;
  }, [activeFeed, hasCameraSelection, hasMonitorError, t]);

  const statsPlaceholder = useMemo(() => {
    if (hasMonitorError) {
      return {
        title: t('monitoring.placeholders.behaviorUnavailable'),
        message: t('monitoring.placeholders.behaviorUnavailableMsg'),
      };
    }
    if (!hasCameraSelection) {
      return {
        title: t('monitoring.placeholders.noCameraSelected'),
        message: t('monitoring.placeholders.noCameraSelectedMsg'),
      };
    }
    if (!linkedPetId) {
      return {
        title: t('monitoring.placeholders.noPetLinked'),
        message: t('monitoring.placeholders.noPetLinkedMsg'),
      };
    }
    if (!isBehaviorLoading && !hasBehaviorStatsData && !hasTimelineData) {
      return {
        title: t('monitoring.placeholders.noData'),
        message: t('monitoring.placeholders.noDataMsg'),
      };
    }
    return null;
  }, [
    hasBehaviorStatsData,
    hasCameraSelection,
    hasMonitorError,
    hasTimelineData,
    isBehaviorLoading,
    linkedPetId,
    t,
  ]);

  return (
    <div id="page-monitoring" className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 select-none animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div id="monitoring-left" className="col-span-1 lg:col-span-8 space-y-6">
        {hasFeeds ? (
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <PetSelector
                selectedPetId={activeFeed?.id ?? selectedPetId}
                setSelectedPetId={setSelectedPetId}
                cameraFeeds={cameraFeeds}
                onLinkPet={activeDeviceId ? () => setShowLinkPetModal(true) : undefined}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowModelSelector(true)}
              title="AI Model"
            >
              <Settings2 className="size-4" />
            </Button>
          </div>
        ) : hasMonitorError ? (
          <MonitoringPlaceholder
            icon={<WifiOff className="size-8 text-rose-500" />}
            title={t('monitoring.placeholders.failedToConnect')}
            message={t('monitoring.placeholders.failedToConnectMsg')}
            onReconnect={monitor.isBlocked ? () => void monitor.reconnectDashboard().catch(() => undefined) : undefined}
            reconnectDisabled={monitor.isLoading}
          />
        ) : (
          <MonitoringPlaceholder
            icon={<Database className="size-8 text-slate-400" />}
            title={t('monitoring.placeholders.noData')}
            message={t('monitoring.placeholders.noFeedsBackend')}
            onReconnect={monitor.isBlocked ? () => void monitor.reconnectDashboard().catch(() => undefined) : undefined}
            reconnectDisabled={monitor.isLoading}
          />
        )}

        {activeFeed ? (
          <>
            <PetProfileCard
              activeFeed={activeFeed}
              snapshot={null}
              onOpenClipsModal={onOpenClipsModal}
            />
            <LiveStreamView
              activeFeed={activeFeed}
              streamActive={streamActive}
              setStreamActive={setStreamActive}
              streamUrl={activeFeed.streamUrl}
              camId={selectedCamId}
              statusText={activeFeed.vibeText ?? cameraConfig.config?.yolo_fps_mode ?? null}
              placeholder={livePlaceholder}
            />
          </>
        ) : (
          <MonitoringPlaceholder
            icon={<Database className="size-8 text-slate-400" />}
            title={t('monitoring.placeholders.noData')}
            message={t('monitoring.placeholders.noProfile')}
            onReconnect={monitor.isBlocked ? () => void monitor.reconnectDashboard().catch(() => undefined) : undefined}
            reconnectDisabled={monitor.isLoading}
          />
        )}
      </div>
      <BehaviorStats
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
        summary={behaviorSummary}
        avgOver3Days={avgOver3Days}
        statsByTime={statsByTime}
        trendStatsByTime={trendStatsByTime}
        activeCategory={todayActivityCounts}
        totalActivities={totalActivities}
        onRefresh={refreshBehaviorData}
        isLoading={isBehaviorLoading}
        error={monitor.error}
        placeholder={statsPlaceholder}
      />

      {showLinkPetModal && activeDeviceId && (
        <LinkPetModal
          activeDeviceId={activeDeviceId}
          activeCameraName={activeFeed?.name ?? activeDeviceId}
          cameraPetMap={cameraPetMap}
          onLink={handleLinkPet}
          onUnlink={handleUnlinkPet}
          isUpdating={isLinkingPet}
          onClose={() => setShowLinkPetModal(false)}
        />
      )}

      {showModelSelector && (
        <ModelSelectorModal
          currentModelKeys={currentModelKeys}
          aiModelSelectionLimit={aiModelLimit}
          petAnimal={pendingPetAnimal !== undefined ? pendingPetAnimal : activeFeed?.petAnimal}
          onSave={handleModelSave}
          onClose={() => { setShowModelSelector(false); setPendingPetAnimal(undefined); }}
        />
      )}
    </div>
  );
}
