/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PetGuest, CameraFeed, BehaviorStats, ActivityClip } from '../types';

export const PET_GUESTS: PetGuest[] = [
  {
    id: 'momo',
    name: 'MOMO',
    breed: '法國垂耳兔 (French Lop)',
    gender: '公',
    checkInDate: '14 Apr - 18 Apr',
    checkOutDate: '18 Apr',
    currentBehavior: '吃飯',
    humidity: 60,
    temperature: 25,
    notes: '輕微感冒，需要餵藥',
    extraServices: '需每日服用藥物，早晚各一次',
    avatarUrl: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=200&h=200',
    age: 3,
    weight: 2.8,
    vaccinated: true,
    color: '咖啡棕 (Sandy Brown)',
    birthday: '2023-04-12',
    status: '監測中',
    photosCount: 4,
    videosCount: 2,
    longNotes: '性格溫和友善，特別親人，最喜歡吃新鮮高山蒲公英與燕麥草。胃口相當好，但因為輕微感冒目前正在接受早晚餵藥護理。放風時活潑好動。',
    healthRecords: [
      '2026-05-18: 體檢一切正常，體重維持在 2.8kg 左右，活動力良好。',
      '2026-05-19: 獸醫進行了例行防蟲驅蟲滴劑護理（Revolution滴劑）。',
      '2026-05-20: 觀察到輕微噴嚏，已按建議啟動早晚口服藥物與籠舍保溫。'
    ]
  },
  {
    id: 'koko',
    name: 'KOKO',
    breed: '荷蘭侏儒兔 (Netherland Dwarf)',
    gender: '母',
    checkInDate: '15 Apr - 20 Apr',
    checkOutDate: '20 Apr',
    currentBehavior: '休息',
    humidity: 55,
    temperature: 24,
    notes: '性格較膽小敏感，拍摸安撫時動作請輕柔',
    extraServices: '每日下午需要人工梳毛一次',
    avatarUrl: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=200&h=200',
    age: 2,
    weight: 1.2,
    vaccinated: true,
    color: '雪白色 (Pure White)',
    birthday: '2024-02-15',
    status: '健康',
    photosCount: 3,
    videosCount: 1,
    longNotes: '性格非常膽小、敏感，對陌生聲音反應較大。需要先將手放在它鼻尖讓它熟悉氣味，輕拍額頭進行安撫，且梳毛時手法應保持極致溫柔度。',
    healthRecords: [
      '2026-05-10: 年度核心兔瘟與巴氏桿菌預防性疫苗接種完成。',
      '2026-05-15: 門齒長度與後臼齒咬合面檢查正常，無異常磨損情況。',
      '2026-05-20: 便便球飽滿，飲水量與食慾皆正常，健康狀態極佳。'
    ]
  },
  {
    id: 'pipi',
    name: 'PIPI',
    breed: '獅子兔 (Lionhead)',
    gender: '公',
    checkInDate: '12 Apr - 19 Apr',
    checkOutDate: '19 Apr',
    currentBehavior: '放風中',
    humidity: 58,
    temperature: 26,
    notes: '胃口良好，便便狀況正常且大顆',
    extraServices: '每日提供新鮮無限量的高山牧草',
    avatarUrl: 'https://images.unsplash.com/photo-1484557985045-eaa252be76fc?auto=format&fit=crop&q=80&w=200&h=200',
    age: 4,
    weight: 3.5,
    vaccinated: false,
    color: '灰白雙色 (Harlequin Gray)',
    birthday: '2022-08-30',
    status: '健康',
    photosCount: 5,
    videosCount: 3,
    longNotes: '極度活躍好動！是放風區的探險大師，對紙箱迷宮、啃咬木與任何藏食玩具都有十足狂熱。胃口非常好，屬於不知疲倦的活潑兔寶。',
    healthRecords: [
      '2026-05-14: 體重 3.5kg，後肢力量飽滿充沛，彈跳高度表現驚人。',
      '2026-05-16: 便便數量多且粒粒金黃，消化排泄消化系統非常良好。',
      '2026-05-20: 在放風運動期間玩耍積極，日常保水與進草量相當理想。'
    ]
  }
];

export const CAMERA_FEEDS: CameraFeed[] = [
  {
    id: 'cam-1',
    name: '特大籠房間1號',
    isOnline: true,
    currentBehavior: '休息',
    petId: 'momo',
    petName: 'MOMO',
    isLive: true,
    vibeText: '吃飯監控中...'
  },
  {
    id: 'cam-2',
    name: '特大籠房間2號',
    isOnline: true,
    currentBehavior: '休息',
    petId: 'koko',
    petName: 'KOKO',
    isLive: true,
    vibeText: '靜止睡眠中...'
  },
  {
    id: 'cam-3',
    name: '特大籠房間3號',
    isOnline: true,
    currentBehavior: '休息',
    petId: 'pipi',
    petName: 'PIPI',
    isLive: false,
    vibeText: '相機離線'
  },
  {
    id: 'cam-4',
    name: '放風區',
    isOnline: true,
    currentBehavior: '活動',
    petId: 'momo',
    petName: 'MOMO',
    isLive: true,
    vibeText: '自由活動中'
  }
];

// Behavior Statistics by Date & Rabbit
export const BEHAVIOR_STATS: Record<string, {
  summary: string;
  avgOver3Days: number;
  statsByTime: BehaviorStats[];
  activityCounts: { label: string; value: number; color: string }[];
  hourlyTrend: { activityYesterday: number; activityToday: number; timeLabel: string }[];
}> = {
  momo: {
    summary: 'MOMO今天大部分時間都在休息，期間監測到9次行為，比昨天多。',
    avgOver3Days: 7,
    statsByTime: [
      { date: '14 apr', activityCount: 7, restingCount: 8, eatingCount: 2, drinkingCount: 1, averageOver3Days: 7 },
      { date: '15 apr', activityCount: 7, restingCount: 7, eatingCount: 3, drinkingCount: 1, averageOver3Days: 7 },
      { date: '16 apr', activityCount: 9, restingCount: 8, eatingCount: 2, drinkingCount: 1, averageOver3Days: 7 }
    ],
    activityCounts: [
      { label: 'monitoring.behavior.resting', value: 8, color: '#94a3b8' },
      { label: 'monitoring.behavior.active', value: 6, color: '#f97316' },
      { label: 'monitoring.behavior.eating', value: 2, color: '#0d9488' },
      { label: 'monitoring.behavior.drinking', value: 1, color: '#06b6d4' }
    ],
    hourlyTrend: [
      { timeLabel: 'monitoring.behavior.active', activityYesterday: 5, activityToday: 6 },
      { timeLabel: 'monitoring.behavior.eating', activityYesterday: 1, activityToday: 2 },
      { timeLabel: 'monitoring.behavior.drinking', activityYesterday: 2, activityToday: 1 }
    ]
  },
  koko: {
    summary: 'KOKO今天適應良好，下午梳毛時表現溫順，進食量與昨日持平。',
    avgOver3Days: 5,
    statsByTime: [
      { date: '14 apr', activityCount: 4, restingCount: 9, eatingCount: 2, drinkingCount: 2, averageOver3Days: 5 },
      { date: '15 apr', activityCount: 5, restingCount: 10, eatingCount: 3, drinkingCount: 1, averageOver3Days: 5 },
      { date: '16 apr', activityCount: 6, restingCount: 9, eatingCount: 3, drinkingCount: 2, averageOver3Days: 5 }
    ],
    activityCounts: [
      { label: 'monitoring.behavior.resting', value: 9, color: '#94a3b8' },
      { label: 'monitoring.behavior.active', value: 6, color: '#f97316' },
      { label: 'monitoring.behavior.eating', value: 3, color: '#0d9488' },
      { label: 'monitoring.behavior.drinking', value: 2, color: '#06b6d4' }
    ],
    hourlyTrend: [
      { timeLabel: 'monitoring.behavior.active', activityYesterday: 4, activityToday: 6 },
      { timeLabel: 'monitoring.behavior.eating', activityYesterday: 3, activityToday: 3 },
      { timeLabel: 'monitoring.behavior.drinking', activityYesterday: 1, activityToday: 2 }
    ]
  },
  pipi: {
    summary: 'PIPI今天非常活躍，在放風區奔跑時間顯著增長，水分補充足夠。',
    avgOver3Days: 8,
    statsByTime: [
      { date: '14 apr', activityCount: 8, restingCount: 6, eatingCount: 3, drinkingCount: 3, averageOver3Days: 8 },
      { date: '15 apr', activityCount: 9, restingCount: 5, eatingCount: 4, drinkingCount: 2, averageOver3Days: 8 },
      { date: '16 apr', activityCount: 11, restingCount: 4, eatingCount: 4, drinkingCount: 3, averageOver3Days: 8 }
    ],
    activityCounts: [
      { label: 'monitoring.behavior.resting', value: 4, color: '#94a3b8' },
      { label: 'monitoring.behavior.active', value: 11, color: '#f97316' },
      { label: 'monitoring.behavior.eating', value: 4, color: '#0d9488' },
      { label: 'monitoring.behavior.drinking', value: 3, color: '#06b6d4' }
    ],
    hourlyTrend: [
      { timeLabel: 'monitoring.behavior.active', activityYesterday: 8, activityToday: 11 },
      { timeLabel: 'monitoring.behavior.eating', activityYesterday: 4, activityToday: 4 },
      { timeLabel: 'monitoring.behavior.drinking', activityYesterday: 2, activityToday: 3 }
    ]
  }
};

export const ACTIVITY_CLIPS: ActivityClip[] = [
  {
    id: 'clip-1',
    timestamp: '2026年4月16日 12:44 下午',
    petName: 'MOMO',
    action: '在放風區喝水30s',
    thumbnailUrl: 'https://images.unsplash.com/photo-1559214369-a6b1a7cd19f6?auto=format&fit=crop&q=80&w=400&h=250',
    isUrgent: false
  },
  {
    id: 'clip-2',
    timestamp: '2026年4月16日 15:40 下午',
    petName: 'MOMO',
    action: '在放風區躺下1min',
    thumbnailUrl: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=400&h=250',
    isUrgent: false
  },
  {
    id: 'clip-3',
    timestamp: '2026年4月16日 10:23 上午',
    petName: 'MOMO',
    action: '開始在放風空間活動30分鐘',
    thumbnailUrl: 'https://images.unsplash.com/photo-1484557985045-eaa252be76fc?auto=format&fit=crop&q=80&w=400&h=250',
    isUrgent: false
  },
  {
    id: 'clip-4',
    timestamp: '2026年4月16日 09:12 上午',
    petName: 'KOKO',
    action: '在籠內進食優質提摩西草',
    thumbnailUrl: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=400&h=250',
    isUrgent: false
  },
  {
    id: 'clip-5',
    timestamp: '2026年4月15日 11:30 上午',
    petName: 'PIPI',
    action: '在放風區探索障礙玩具',
    thumbnailUrl: 'https://images.unsplash.com/photo-1559214369-a6b1a7cd19f6?auto=format&fit=crop&q=80&w=400&h=250',
    isUrgent: false
  },
  {
    id: 'clip-6',
    timestamp: '2026年4月16日 01:15 上午',
    petName: 'MOMO',
    action: '夜間稍微抓撓耳朵，已紀錄並持續追蹤異常情況',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&q=80&w=400&h=250',
    isUrgent: true
  }
];
