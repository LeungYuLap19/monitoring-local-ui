import { useCallback, useEffect, useRef, useState } from 'react';
import type { BehaviorSSEEvent, CameraStatsSSEEvent } from '../../types/lib/behaviorSSE';
import { getPetMonitorBehaviorSSEUrl } from '../../lib/services/petMonitorService';

export function useBehaviorSSE() {
  const [connected, setConnected] = useState(false);
  const [behaviors, setBehaviors] = useState<BehaviorSSEEvent[]>([]);
  const [cameraStats, setCameraStats] = useState<Map<number, CameraStatsSSEEvent>>(new Map());
  const [lastBehaviorUpdate, setLastBehaviorUpdate] = useState<number | null>(null);
  const [lastStatsUpdate, setLastStatsUpdate] = useState<number | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = getPetMonitorBehaviorSSEUrl();
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    es.addEventListener('behavior', (event) => {
      try {
        const data: BehaviorSSEEvent[] = JSON.parse(event.data);
        setBehaviors(data);
        setLastBehaviorUpdate(Date.now());
      } catch { /* ignore malformed events */ }
    });

    es.addEventListener('stats', (event) => {
      try {
        const data: CameraStatsSSEEvent[] = JSON.parse(event.data);
        setCameraStats(new Map(data.map((s) => [s.cam_id, s])));
        setLastStatsUpdate(Date.now());
      } catch { /* ignore malformed events */ }
    });
  }, []);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setConnected(false);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setCameraStats(new Map());
    setBehaviors([]);
    connect();
  }, [disconnect, connect]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  const getBehaviorForCam = useCallback(
    (camId: number) => behaviors.filter((e) => e.cam_id === camId),
    [behaviors],
  );

  const getStatsForCam = useCallback(
    (camId: number) => cameraStats.get(camId) ?? null,
    [cameraStats],
  );

  return {
    connected,
    behaviors,
    cameraStats,
    lastBehaviorUpdate,
    lastStatsUpdate,
    reconnect,
    getBehaviorForCam,
    getStatsForCam,
  };
}
