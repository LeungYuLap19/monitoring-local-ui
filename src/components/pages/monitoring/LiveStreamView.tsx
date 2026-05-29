/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, PlayCircle, Video } from 'lucide-react';
import { LiveStreamViewProps } from '../../../types';
import { useTranslation } from '../../../lib/i18n';

export default function LiveStreamView({
  activeFeed,
  streamActive,
  setStreamActive,
  streamUrl,
  camId,
  statusText,
  placeholder = null,
}: LiveStreamViewProps) {
  const { t } = useTranslation();

  if (placeholder) {
    return (
      <div id="video-stream-dashboard" className="bg-slate-900 rounded-3xl overflow-hidden relative shadow-lg aspect-video group select-none flex items-center justify-center">
        <div className="max-w-sm px-8 text-center text-slate-300 space-y-3">
          <AlertTriangle className="size-10 text-amber-400 mx-auto" />
          <div className="space-y-1">
            <p className="text-sm font-extrabold">{placeholder.title}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{placeholder.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const displayName = activeFeed.petName || activeFeed.name;

  return (
    <div id="video-stream-dashboard" className="bg-slate-900 rounded-3xl overflow-hidden relative shadow-lg aspect-video group select-none flex items-center justify-center">
      {streamActive ? (
        <>
          {streamUrl ? (
            <img
              src={streamUrl}
              alt={`${displayName} live stream`}
              className="size-full object-cover bg-slate-950"
            />
          ) : (
            <div className="size-full bg-slate-900 flex flex-col items-center justify-center text-slate-400 gap-3 font-mono relative overflow-hidden select-none">
              <div className="absolute top-0 left-0 w-full h-1 bg-teal-500/10 animate-pulse" />
              <Video className="size-10 text-teal-500 animate-pulse" />
              <span className="text-xs tracking-widest text-slate-300 uppercase font-bold">CCTV PLAYGROUND {activeFeed.id.toUpperCase()}</span>
              <span className="text-[10px] text-slate-500 font-medium">{displayName} - {t('overview.liveStream.observing')}</span>
            </div>
          )}

          <div className="absolute top-5 right-5 flex items-center gap-3 bg-black/60 backdrop-blur-md text-white rounded-xl px-3 py-1 text-xs font-bold font-sans">
            <span>{t('overview.liveStream.playground')}</span>
            <div className="relative inline-flex items-center cursor-pointer" onClick={() => setStreamActive(false)}>
              <div className="w-9 h-5 bg-teal-500 rounded-full transition-colors relative">
                <div className="size-4 bg-white rounded-full absolute top-0.5 right-0.5 transition-all shadow-sm" />
              </div>
              <span className="ml-1.5 text-[9px] font-black font-mono">ON</span>
            </div>
          </div>

        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-slate-500 gap-3">
          <PlayCircle className="size-12 text-slate-600" />
          <div className="text-center">
            <span className="block text-sm font-bold text-slate-300">{t('overview.liveStream.cameraPaused')}</span>
            <button
              onClick={() => setStreamActive(true)}
              className="mt-3 text-xs bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl"
            >
              {t('overview.liveStream.restartStream')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
