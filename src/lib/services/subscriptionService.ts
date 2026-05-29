import { getStoredAccessToken } from '../utils/auth';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');
const API_KEY = import.meta.env.VITE_API_KEY ?? '';

export interface SubscriptionEntitlement {
  tier: string;
  status: string;
  cameraLimit: number;
  aiModelSelectionLimit: number;
  startedAt: string | null;
  endsAt: string | null;
}

export interface MonitoringSettings {
  selectedCameraIds: string[];
  selectedAiModelKeys: string[];
  entitlement: SubscriptionEntitlement;
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json',
  };
  const token = getStoredAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function getSubscription(): Promise<SubscriptionEntitlement> {
  const res = await fetch(`${API_BASE_URL}/user/subscription`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.data;
}

export async function getMonitoringSettings(): Promise<MonitoringSettings> {
  const res = await fetch(`${API_BASE_URL}/user/subscription/monitoring`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.data;
}

export async function patchMonitoringSettings(body: {
  selectedCameraIds: string[];
  selectedAiModelKeys: string[];
}): Promise<MonitoringSettings> {
  const res = await fetch(`${API_BASE_URL}/user/subscription/monitoring`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    const err = new Error(json.errorKey || `HTTP ${res.status}`) as Error & { status: number; errorKey?: string };
    err.status = res.status;
    err.errorKey = json.errorKey;
    throw err;
  }
  const json = await res.json();
  return json.data;
}
