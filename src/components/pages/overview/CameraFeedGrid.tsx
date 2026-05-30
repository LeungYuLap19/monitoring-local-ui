/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { VideoOff, Play, ArrowRight, Video } from 'lucide-react';
import { CameraFeed, CameraFeedGridProps, CameraCardProps } from '../../../types';
import { useTranslation } from '../../../lib/i18n';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';

export default function CameraFeedGrid({
  feeds,
  onSelectCamera,
  onClearFilters,
  isBlocked = false,
  onReconnect,
}: CameraFeedGridProps) {
  const { t } = useTranslation();
  if (feeds.length === 0) {
    return (
      <Card className="p-12 rounded-2xl text-center gap-3">
        <CardContent className="p-0 space-y-3 flex flex-col items-center">
          <VideoOff className="size-12 text-slate-300" />
          <h4 className="text-sm font-bold text-slate-700">{isBlocked ? 'Monitoring paused' : t('overview.emptyState')}</h4>
          <p className="text-xs text-slate-400 max-w-sm font-medium">
            {isBlocked
              ? 'The monitoring API request failed. Automatic reconnect is paused until you retry manually.'
              : t('overview.emptyStateHint')}
          </p>
          <div className="mt-2 flex items-center gap-2">
            {isBlocked && onReconnect ? (
              <Button variant="outline" onClick={onReconnect}>
                Reconnect
              </Button>
            ) : null}
            <Button variant="ghost" onClick={onClearFilters} className="text-teal-600 bg-teal-50 hover:bg-teal-100">
              {t('overview.clearFilter')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div id="camera-feeds-layout" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {feeds.map(feed => (
        <CameraCard key={feed.id} feed={feed} onSelectCamera={onSelectCamera} />
      ))}
    </div>
  );
}


function CameraCard({ feed, onSelectCamera }: CameraCardProps) {
  const { t } = useTranslation();
  return (
    <Card
      id={`camera-card-${feed.id}`}
      onClick={() => feed.isOnline && onSelectCamera(feed.id)}
      className={`rounded-2xl overflow-hidden p-0 gap-0 flex flex-col justify-between transition-all group ${
        feed.isOnline
          ? 'hover:shadow-md hover:border-teal-200 cursor-pointer hover:-translate-y-0.5'
          : 'opacity-75'
      }`}
    >
      {/* Card Header information */}
      <div className="p-5 flex justify-between items-start border-b border-slate-100">
        <div>
          <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-teal-600 transition-colors">
            {feed.name}
          </h4>
          <p className="text-[10px] text-slate-400 font-semibold font-mono mt-0.5 uppercase tracking-wider">
            {feed.petId ? `${t('overview.cameraFeed.resident')} ${feed.petName}` : t('overview.cameraFeed.empty')}
          </p>
        </div>

        {/* Camera connection indicator */}
        <div className="flex items-center gap-1.5">
          <span className={`size-1.5 rounded-full ${feed.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
          <span className={`text-[10px] font-black uppercase ${feed.isOnline ? 'text-emerald-600' : 'text-slate-400'}`}>
            {feed.isOnline ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>

{/* Thumbnail of feed */}
      <div className="relative aspect-video bg-slate-900 overflow-hidden">
        {feed.isOnline ? (
          <>
            {feed.streamUrl ? (
              <img
                src={feed.streamUrl}
                alt={feed.name}
                className="size-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="size-full bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-2 font-mono select-none">
                <Video className="size-6 text-teal-600 animate-pulse" />
                <span className="text-[9px] tracking-widest text-slate-400 uppercase font-black">CCTV {feed.id.toUpperCase()}</span>
                <span className="text-[9px] text-slate-500 font-bold">{feed.petName ? `GUEST: ${feed.petName}` : 'STANDBY'}</span>
              </div>
            )}

            {/* Red Live banner */}
            <div className="absolute top-3 left-3 bg-rose-600/90 text-white font-black text-[9px] px-2 py-0.5 rounded-md flex items-center gap-1 uppercase tracking-widest shadow-md">
              <span className="size-1 rounded-full bg-white animate-ping" />
              <span>LIVE</span>
            </div>

            {/* Hover Overlay play button effect */}
            <div className="absolute inset-0 bg-teal-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="size-10 rounded-full bg-white/95 text-teal-600 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                <Play className="size-4 fill-current ml-0.5" />
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2 p-4">
            <VideoOff className="size-8 text-slate-300" />
            <span className="text-xs font-semibold text-slate-300">{t('overview.cameraFeed.offline')}</span>
          </div>
        )}
      </div>

      {/* Footer detail actions */}
      <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-xs">
        <span className="text-slate-400 font-bold">{feed.vibeText || '設備狀態良好'}</span>
        {feed.isOnline && (
          <span className="text-teal-600 font-extrabold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>{t('overview.cameraFeed.watch')}</span>
            <ArrowRight className="size-3.5" />
          </span>
        )}
      </div>
    </Card>
  );
}
