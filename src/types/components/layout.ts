import { LucideIcon } from 'lucide-react';
import { TabId, PetGuest } from '../constants/domain';

export interface NavItem {
  id: TabId;
  label: string;
  icon: LucideIcon;
  badge?: 'pulse' | 'dot';
  roles?: ('user' | 'ngo')[];
}

export interface SidebarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  hasUnsentLogs: boolean;
  role?: 'user' | 'ngo';
  isOpen?: boolean;
  onClose?: () => void;
  adminName?: string;
  userEmail?: string;
  onLogout?: () => void;
  onMenuClick?: () => void;
  xiaomiConnected?: boolean;
  onXiaomiLogout?: () => void;
}

export interface HeaderProps {
  userEmail?: string;
  adminName?: string;
  role?: 'user' | 'ngo';
  onNotificationClick?: () => void;
  onMenuClick?: () => void;
  onLogout?: () => void;
}
