import React, { useState, useMemo } from 'react';
import { Search, Download, Film, ShieldAlert, Check } from 'lucide-react';
import { ActivityClip, ClipSelectorModalProps, FilterCategory } from '../../../types';
import { ACTIVITY_CLIPS } from '../../../constants';
import { useTranslation } from '../../../lib/i18n';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../ui/dialog';

export default function ClipSelectorModal({
  petName,
  onClose,
  clips = ACTIVITY_CLIPS,
  getVideoUrl,
}: ClipSelectorModalProps) {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadedClips, setDownloadedClips] = useState<string[]>([]);

  const filteredClips = useMemo(() => {
    return clips.filter(clip => {
      const matchesPet = clip.petName.toLowerCase() === petName.toLowerCase() ||
        clip.petName.toLowerCase().startsWith('camera');
      const matchesSearch = clip.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            clip.timestamp.toLowerCase().includes(searchQuery.toLowerCase());
      const normalizedAction = clip.action.toLowerCase();
      const matchesCategory =
        activeCategory === 'all' ? true :
        activeCategory === 'active' ? (clip.action.includes('活動') || clip.action.includes('奔跑') || clip.action.includes('探索') || normalizedAction.includes('active')) :
        activeCategory === 'eat' ? clip.action.includes('進食') || normalizedAction.includes('eat') :
        activeCategory === 'drink' ? clip.action.includes('喝水') || normalizedAction.includes('drink') :
        activeCategory === 'abnormal' ? clip.isUrgent : true;
      return matchesPet && matchesSearch && matchesCategory;
    });
  }, [activeCategory, petName, clips, searchQuery]);

  const handleDownload = (clipId: string) => {
    if (downloadedClips.includes(clipId)) return;
    setDownloadedClips([...downloadedClips, clipId]);
  };

  const handleOpenClip = (clip: ActivityClip) => {
    const url = getVideoUrl?.(clip) ?? clip.videoUrl;
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent showCloseButton={false} className="sm:max-w-4xl p-0 max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="px-4 sm:px-8 py-4 border-b border-slate-100 bg-slate-50/50">
          <DialogTitle className="text-base font-black text-slate-800 flex items-center gap-2">
            <Film className="size-5 text-teal-600" />
            <span>{t('monitoring.clips.title', { name: petName })}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400 font-medium mt-0.5">
            {t('monitoring.clips.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-100 flex flex-col lg:flex-row gap-4 justify-between items-center">
          <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as FilterCategory)}>
            <TabsList className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto bg-transparent h-auto p-0">
              <TabsTrigger value="all" className="px-3 py-1.5 rounded-xl text-xs font-bold data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow bg-white text-slate-500 hover:bg-slate-100/50">
                {t('monitoring.clips.all')}
              </TabsTrigger>
              <TabsTrigger value="active" className="px-3 py-1.5 rounded-xl text-xs font-bold data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow bg-white text-slate-500 hover:bg-slate-100/50">
                {t('monitoring.clips.active')}
              </TabsTrigger>
              <TabsTrigger value="eat" className="px-3 py-1.5 rounded-xl text-xs font-bold data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow bg-white text-slate-500 hover:bg-slate-100/50">
                {t('monitoring.clips.eat')}
              </TabsTrigger>
              <TabsTrigger value="drink" className="px-3 py-1.5 rounded-xl text-xs font-bold data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow bg-white text-slate-500 hover:bg-slate-100/50">
                {t('monitoring.clips.drink')}
              </TabsTrigger>
              <TabsTrigger value="abnormal" className="px-3 py-1.5 rounded-xl text-xs font-bold data-[state=active]:bg-rose-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-rose-200 bg-white text-rose-500 hover:bg-rose-50">
                {t('monitoring.clips.abnormal')}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative shrink-0 w-full lg:w-60">
            <Search className="absolute left-3 top-2.5 size-3.5 text-slate-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('monitoring.clips.searchPlaceholder')}
              className="pl-9 pr-3 py-2 text-xs font-medium bg-white"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 bg-slate-50/30">
          {filteredClips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredClips.map(clip => {
                const isDownloaded = downloadedClips.includes(clip.id);
                return (
                  <div
                    key={clip.id}
                    className={`bg-white rounded-2xl overflow-hidden shadow-sm transition-all flex flex-col justify-between ${
                      clip.isUrgent
                        ? 'shadow-md shadow-rose-50 scale-[1.01]'
                        : 'hover:shadow-md'
                    }`}
                  >
                    <div className="relative aspect-video bg-slate-950 overflow-hidden">
                      {clip.thumbnailUrl ? (
                        <img src={clip.thumbnailUrl} alt={clip.action} className="size-full object-cover" loading="lazy" />
                      ) : (
                        <div className="size-full bg-slate-900 flex flex-col items-center justify-center text-slate-500 font-mono text-[10px] select-none">
                          <Film className="size-6 text-teal-600 mb-1 animate-pulse" />
                          <span>VIDEO INDEX: {clip.id.toUpperCase()}</span>
                          <span className="text-[8px] text-slate-600 uppercase font-bold">CLIP PLACEHOLDER</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/35 flex items-center justify-center cursor-pointer" onClick={() => handleOpenClip(clip)}>
                        <div className="size-12 rounded-full bg-white/95 text-teal-600 flex items-center justify-center shadow-xl hover:scale-105 transition-transform">
                          <Film className="size-5 ml-0.5" />
                        </div>
                      </div>
                      {clip.isUrgent && (
                        <Badge className="absolute top-3 left-3 bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest animate-pulse border-0">
                          <ShieldAlert className="size-3.5 mr-1" />
                          AI ABNORMAL INCIDENT
                        </Badge>
                      )}
                      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white font-mono text-[9px] px-2 py-0.5 rounded">
                        {clip.timestamp}
                      </div>
                    </div>
                    <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                      <div className="space-y-1">
                        <Badge variant="outline" className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          clip.action.includes('喝水') ? 'bg-cyan-50 text-cyan-600' :
                          clip.action.includes('進食') ? 'bg-emerald-50 text-emerald-600' :
                          clip.isUrgent ? 'bg-rose-50 text-rose-600' : 'bg-orange-50 text-orange-600'
                        }`}>
                          {clip.action.includes('喝水') ? t('monitoring.clips.drink') :
                           clip.action.includes('進食') ? t('monitoring.clips.eat') :
                           clip.isUrgent ? t('monitoring.clips.abnormal') : t('monitoring.clips.active')}
                        </Badge>
                        <p className={`text-xs font-bold leading-normal ${clip.isUrgent ? 'text-rose-600' : 'text-slate-700'}`}>
                          {clip.action}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-100">
                        <span className="text-slate-400 font-bold font-mono">1080P MP4 - 1.4 MB</span>
                        <Button
                          size="xs"
                          variant={isDownloaded ? 'default' : 'secondary'}
                          onClick={() => {
                            handleDownload(clip.id);
                            handleOpenClip(clip);
                          }}
                          className={isDownloaded ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                        >
                          {isDownloaded ? <><Check className="size-3.5" /><span>{t('monitoring.clips.downloaded')}</span></> : <><Download className="size-3.5 animate-bounce" /><span>{t('monitoring.clips.download')}</span></>}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 space-y-3">
              <Film className="size-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-400">{t('monitoring.clips.noResults')}</p>
              <span className="text-[10px] text-slate-400 block font-medium">{t('monitoring.clips.noResultsHint')}</span>
            </div>
          )}
        </div>

        <DialogFooter className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <Button onClick={onClose}>
            {t('common.done')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
