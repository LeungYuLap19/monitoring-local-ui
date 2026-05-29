import { LayoutDashboard, Video, Heart, ClipboardCheck } from 'lucide-react';
import { NavItem } from '../types';

const VERCEL_URL = import.meta.env.VITE_VERCEL_URL || 'https://monitoring-dashboard-eosin.vercel.app';

export const LOCAL_TABS = new Set(['overview', 'monitoring']);

export const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'nav.overview', icon: LayoutDashboard },
  { id: 'monitoring', label: 'nav.monitoring', icon: Video, badge: 'pulse' },
  { id: 'pets', label: 'nav.pets', icon: Heart },
  { id: 'client-view', label: 'nav.clientLog', icon: ClipboardCheck, badge: 'dot', roles: ['ngo'] },
];

export function getVercelRedirectUrl(tab: string): string {
  const path = tab === 'overview' ? '/' : `/${tab}`;
  return `${VERCEL_URL}${path}`;
}
