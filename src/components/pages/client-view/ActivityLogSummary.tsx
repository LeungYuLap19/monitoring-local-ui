import { ActivityLogSummaryProps } from '../../../types';
import { useTranslation } from '../../../lib/i18n';

export default function ActivityLogSummary({ summaryText }: ActivityLogSummaryProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <span className="block text-xs font-black text-slate-400 uppercase tracking-widest">{t('clientView.summaryLabel')}</span>
      <p className="text-sm text-slate-600 leading-relaxed font-semibold bg-slate-50 p-5 rounded-2xl">
        {summaryText}
      </p>
    </div>
  );
}
