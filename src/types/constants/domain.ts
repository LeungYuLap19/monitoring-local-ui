import { LucideIcon } from 'lucide-react';

export type TabId = 'overview' | 'monitoring' | 'client-view' | 'pets' | 'none';

export interface PetGuest {
  id: string;
  name: string;
  breed: string;
  gender: '公' | '母';
  checkInDate: string;
  checkOutDate: string;
  currentBehavior: string;
  humidity: number;
  temperature: number;
  notes: string;
  extraServices: string;
  avatarUrl?: string;
  age?: number;
  weight?: number;
  vaccinated?: boolean;
  color?: string;
  birthday?: string;
  status?: string;
  photosCount?: number;
  videosCount?: number;
  longNotes?: string;
  healthRecords?: string[];
}

export interface CameraFeed {
  id: string;
  name: string;
  isOnline: boolean;
  currentBehavior: string;
  petId?: string;
  petName?: string;
  petBreed?: string | null;
  petAnimal?: string | null;
  petStatus?: string | null;
  isLive: boolean;
  vibeText?: string;
  streamUrl?: string;
  camId?: number | null;
  deviceId?: string | null;
}

export interface ActivityClip {
  id: string;
  timestamp: string;
  petName: string;
  action: string;
  thumbnailUrl: string;
  videoUrl?: string;
  isUrgent: boolean;
}

export interface ActivityCount {
  label: string;
  value: number;
  color: string;
}

export interface StatByTime {
  date: string;
  activityCount: number;
  restingCount: number;
  eatingCount: number;
  drinkingCount: number;
  averageOver3Days: number;
}

export type BehaviorStats = StatByTime;

export interface LogTemplateConfig {
  date: string;
  petId: string;
  summaryText: string;
  showClips: boolean;
  selectedClips: string[];
}
