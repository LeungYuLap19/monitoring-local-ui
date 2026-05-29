import { useCallback, useEffect, useState } from 'react';
import { getXiaomiAccounts } from '../../lib/services/go2rtcService';

const XIAOMI_REGION_KEY = 'xiaomi_region';

export function useXiaomiStatus() {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const region = localStorage.getItem(XIAOMI_REGION_KEY) || 'sg';

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getXiaomiAccounts();
      setAccounts(result);
    } catch {
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    isConnected: accounts.length > 0,
    accounts,
    region,
    loading,
    refresh,
    setRegion: (r: string) => localStorage.setItem(XIAOMI_REGION_KEY, r),
  };
}
