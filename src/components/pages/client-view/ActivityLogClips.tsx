import { PlayCircle } from 'lucide-react';
import { ActivityLogClipsProps } from '../../../types';
import { useTranslation } from '../../../lib/i18n';

export default function ActivityLogClips({ clips }: ActivityLogClipsProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <span className="block text-xs font-black text-slate-400 uppercase tracking-widest">{t('clientView.clipsLabel')}</span>

      {clips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clips.map((clip) => (
            <button
              key={clip.id}
              type="button"
              className="relative rounded-2xl overflow-hidden shadow-sm aspect-video bg-slate-950 group text-left"
              onClick={() => {
                if (clip.videoUrl) {
                  window.open(clip.videoUrl, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              {clip.thumbnailUrl ? (
                <img
                  src={clip.thumbnailUrl}
                  alt={clip.action}
                  className="size-full object-cover bg-slate-950"
                  loading="lazy"
                />
              ) : (
                <div className="size-full flex flex-col items-center justify-center bg-slate-950 text-slate-500 font-mono text-[10px] select-none">
                  <PlayCircle className="size-8 text-teal-600 mb-1 animate-pulse" />
                  <span>{clip.action}</span>
                  <span className="text-[8px] text-slate-600 lowercase mt-0.5">{clip.id}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                <div className="size-12 rounded-full bg-white/95 text-teal-600 flex items-center justify-center shadow-xl">
                  <PlayCircle className="size-6" />
                </div>
              </div>
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-[10px] text-white font-mono">
                {clip.timestamp}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
          <p className="text-sm font-bold text-slate-600">{t('clientView.noClips')}</p>
          <p className="mt-1 text-xs text-slate-400">{t('clientView.noClipsHint')}</p>
        </div>
      )}
    </div>
  );
}
