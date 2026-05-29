import { Check } from 'lucide-react';
import { ActivityLogHealthProps } from '../../../types';
import { useTranslation } from '../../../lib/i18n';

export default function ActivityLogHealth({
  statusText,
  statusTone = 'ok',
  cameraName,
  streamStatus,
  behaviorStatus,
  telemetryStatus,
}: ActivityLogHealthProps) {
  const { t } = useTranslation();
  const toneClasses = statusTone === 'warn'
    ? 'text-amber-800 bg-amber-50 border-amber-100'
    : 'text-emerald-800 bg-green-50 border-green-100';
  const iconClasses = statusTone === 'warn' ? 'text-amber-500' : 'text-emerald-500';

  return (
    <div className="bg-green-50/40 p-6 rounded-2xl space-y-4">
      <span className="block text-[11px] font-black text-teal-600 uppercase tracking-widest">{t('clientView.healthLabel')}</span>

      <div className="space-y-3 text-xs">
        <div className={`flex items-center gap-2 font-bold p-3 rounded-xl border ${toneClasses}`}>
          <Check className={`size-4.5 shrink-0 ${iconClasses}`} />
          <span>{statusText}</span>
        </div>

        <div className="text-slate-600 leading-relaxed font-medium space-y-2">
          <div className="flex justify-between border-b border-slate-100 border-dashed pb-1.5">
            <span className="font-bold">{t('clientView.healthCamera')}</span>
            <span className="font-semibold text-teal-600">{cameraName}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 border-dashed pb-1.5">
            <span className="font-bold">{t('clientView.healthStream')}</span>
            <span className="font-semibold text-emerald-600">{streamStatus}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 border-dashed pb-1.5">
            <span className="font-bold">{t('clientView.healthBehavior')}</span>
            <span className="font-semibold text-cyan-600">{behaviorStatus}</span>
          </div>
          <div className="flex justify-between pb-1.5">
            <span className="font-bold">{t('clientView.healthTelemetry')}</span>
            <span className="font-semibold text-teal-600">{telemetryStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
