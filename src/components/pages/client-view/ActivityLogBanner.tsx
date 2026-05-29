import { Sparkles } from 'lucide-react';
import { ActivityLogBannerProps } from '../../../types';
import { useTranslation } from '../../../lib/i18n';

export default function ActivityLogBanner({ petName }: ActivityLogBannerProps) {
  const { t } = useTranslation();
  return (
    <div id="simulated-browser-note" className="bg-gradient-to-r from-teal-500 to-emerald-600 p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest w-fit mb-1.5 text-yellow-300">
          <Sparkles className="size-3.5" />
          <span>{t('clientView.bannerBadge')}</span>
        </div>
        <h3 className="text-base font-black">{t('clientView.bannerTitle')}</h3>
        <p className="text-xs text-teal-50/80 font-medium">{t('clientView.bannerDescription')}</p>
      </div>

      <div className="text-xs font-bold bg-white text-teal-600 px-4 py-2 rounded-xl flex items-center gap-1.5 shadow">
        <span>{t('clientView.simulatingLabel')}</span>
        <span className="font-black text-rose-600">{petName}</span>
      </div>
    </div>
  );
}
