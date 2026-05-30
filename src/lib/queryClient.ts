import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { AUTH_STORAGE_KEYS } from './utils/auth';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

function getSessionBuster(): string {
  try {
    const raw = window.sessionStorage.getItem(AUTH_STORAGE_KEYS.authUser);
    if (!raw) return 'anonymous';
    const user = JSON.parse(raw);
    return user?._id ?? user?.id ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

export const sessionPersister = createSyncStoragePersister({
  storage: window.sessionStorage,
  key: 'pet-query-cache',
});

export const persistBuster = getSessionBuster();
