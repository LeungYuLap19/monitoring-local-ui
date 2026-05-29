import type {
  AwsBehaviorEventsResponse,
  AwsBehaviorSummaryResponse,
  AwsBehaviorTimelineResponse,
  PetMonitorBehaviorTimelineBucket,
} from '../../types/lib/monitoring';
import { getStoredAccessToken } from '../utils/auth';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');
const API_KEY = import.meta.env.VITE_API_KEY ?? '';

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

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: authHeaders() });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const json = await response.json();
  return json.data ?? json;
}

export async function getBehaviorSummary(
  petId: string,
  from: string,
  to: string,
): Promise<AwsBehaviorSummaryResponse> {
  const params = new URLSearchParams({ petId, from, to });
  return fetchJson(`${API_BASE_URL}/pet/behavior/summary?${params}`);
}

export async function getBehaviorTimeline(
  petId: string,
  from: string,
  to: string,
  bucket: PetMonitorBehaviorTimelineBucket = '1d',
): Promise<AwsBehaviorTimelineResponse> {
  const params = new URLSearchParams({ petId, from, to, bucket });
  return fetchJson(`${API_BASE_URL}/pet/behavior/timeline?${params}`);
}

export interface BehaviorEventsQuery {
  petId: string;
  from?: string;
  to?: string;
  behavior?: string;
  page?: number;
  limit?: number;
}

export async function getBehaviorEvents(
  query: BehaviorEventsQuery,
): Promise<AwsBehaviorEventsResponse> {
  const params = new URLSearchParams();
  params.set('petId', query.petId);
  if (query.from) params.set('from', query.from);
  if (query.to) params.set('to', query.to);
  if (query.behavior) params.set('behavior', query.behavior);
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  return fetchJson(`${API_BASE_URL}/pet/behavior/events?${params}`);
}
