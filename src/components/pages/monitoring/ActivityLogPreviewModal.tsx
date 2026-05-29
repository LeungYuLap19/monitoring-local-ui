import React, { useState } from 'react';
import { Check, EyeOff, Loader2, PlayCircle } from 'lucide-react';
import { ActivityLogPreviewModalProps } from '../../../types';
import { useTranslation } from '../../../lib/i18n';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Checkbox } from '../../ui/checkbox';
import { Label } from '../../ui/label';
import { Bar, BarChart, Cell, XAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '../../ui/chart';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../ui/dialog';

export default function ActivityLogPreviewModal({
  petId,
  onClose,
  onSendSuccess
}: ActivityLogPreviewModalProps) {
  const { t } = useTranslation();
  const cameraLabel = petId.toUpperCase();

  const [includeClips, setIncludeClips] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      onSendSuccess(petId);
    }, 1200);
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent showCloseButton={false} className="sm:max-w-5xl p-0">
        <DialogHeader className="px-4 sm:px-8 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <DialogTitle className="text-base font-black text-slate-800">
            {t('monitoring.logPreview.title')}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400 font-medium mt-0.5">
            {t('monitoring.logPreview.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6 flex-1 bg-slate-100/50">
          <div className="bg-white p-5 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="flex items-center gap-3">
              <Checkbox id="checkbox-clips" checked={includeClips} onCheckedChange={(checked) => setIncludeClips(!!checked)} />
              <Label htmlFor="checkbox-clips" className="text-xs font-bold text-slate-700 cursor-pointer">
                {t('monitoring.logPreview.includeClips')}
              </Label>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 justify-end text-xs text-slate-400 font-medium">
              <span>{t('monitoring.logPreview.remarksLabel')}</span>
              <Input type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full sm:w-64" placeholder={t('monitoring.logPreview.remarksPlaceholder')} />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-8 rounded-3xl shadow-sm flex flex-col lg:flex-row gap-6 lg:gap-8">
            <div className="flex-1 space-y-8">
              <div className="border-b border-slate-100 pb-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="size-8 rounded-lg bg-teal-600 flex items-center justify-center font-bold text-xs text-white">HK</div>
                  <span className="text-xs font-extrabold text-teal-600 uppercase tracking-wide">{t('header.orgName')}</span>
                </div>
                <h4 className="text-lg font-black text-slate-800 tracking-tight">
                  <span className="text-teal-600">{cameraLabel}</span> {t('monitoring.logPreview.dateTitle')}
                </h4>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-teal-600 font-bold">{t('monitoring.logPreview.summaryLabel')}</span>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold bg-green-50/40 p-4 rounded-xl border">
                  No backend behavior summary is available for this monitoring selection.
                </p>
              </div>

              <div className="space-y-3">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">{t('monitoring.logPreview.frequencyLabel')}</span>
                <div className="bg-slate-50/50 p-4 rounded-xl flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="block text-2xl font-black text-slate-800 leading-none">
                      0 <span className="text-[10px] text-slate-400 font-semibold">{t('monitoring.logPreview.perDay')}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{t('monitoring.logPreview.avg3Days')}: 0{t('monitoring.logPreview.perDay')}</span>
                  </div>
                  <ChartContainer config={{ activityCount: { label: t('monitoring.logPreview.perDay'), color: '#0d9488' } }} className="h-[60px] w-[120px]">
                    <BarChart data={[
                      { date: 'N-2', activityCount: 0, fill: '#94a3b8' },
                      { date: 'N-1', activityCount: 0, fill: '#94a3b8' },
                      { date: 'Now', activityCount: 0, fill: '#0d9488' },
                    ]} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                      <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="activityCount" radius={[3, 3, 0, 0]}>
                        {[0, 1, 2].map((i) => (
                          <Cell key={i} fill={i === 2 ? '#0d9488' : '#94a3b8'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </div>
              </div>

              <div className="space-y-3">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">{t('monitoring.logPreview.detailLabel')}</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 bg-slate-50/30 p-4 rounded-xl text-[11px] font-medium text-slate-500">
                    No real activity breakdown is available. Mock monitoring data is no longer displayed here.
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-600 bg-green-50/50 p-3 rounded-xl border">
                  <Check className="size-4 shrink-0 text-emerald-500" />
                  <span>{t('monitoring.logPreview.noAbnormal')}</span>
                </div>
              </div>
            </div>

            {includeClips ? (
              <div className="w-full lg:w-80 shrink-0 border-t border-slate-100 lg:border-t border-slate-100-0 lg:border-l border-slate-100 border-dashed pt-6 lg:pt-0 lg:pl-8 space-y-6">
                <div>
                  <h5 className="font-extrabold text-slate-800 text-xs">{t('monitoring.logPreview.clipsTitle')}</h5>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">{t('monitoring.logPreview.clipsDescription')}</p>
                </div>
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden shadow-sm aspect-video bg-slate-950">
                    <div className="size-full flex flex-col items-center justify-center text-slate-500 font-mono text-[10px] select-none">
                      <PlayCircle className="size-8 text-teal-600 mb-1 animate-pulse" />
                      <span>{t('monitoring.logPreview.clipDrinking')}</span>
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[9px] text-white font-mono">12:44 PM</div>
                  </div>
                  <div className="relative rounded-2xl overflow-hidden shadow-sm aspect-video bg-slate-950">
                    <div className="size-full flex flex-col items-center justify-center text-slate-500 font-mono text-[10px] select-none">
                      <PlayCircle className="size-8 text-teal-600 mb-1 animate-pulse" />
                      <span>{t('monitoring.logPreview.clipSleep')}</span>
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[9px] text-white font-mono">15:40 PM</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full md:w-80 shrink-0 bg-slate-50 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center text-slate-400 gap-2">
                <EyeOff className="size-8 text-slate-300" />
                <span className="text-xs font-bold">{t('monitoring.logPreview.noClips')}</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-4 sm:px-8 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <Button variant="secondary" onClick={onClose}>{t('common.back')}</Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending ? (<><Loader2 className="size-3.5 animate-spin" /><span>{t('monitoring.logPreview.sending')}</span></>) : (<><Check className="size-3.5" /><span>{t('monitoring.logPreview.send')}</span></>)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
