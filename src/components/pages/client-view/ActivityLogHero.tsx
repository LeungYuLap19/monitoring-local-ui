import { ActivityLogHeroProps } from '../../../types';
import { useTranslation } from '../../../lib/i18n';

export default function ActivityLogHero({ petName }: ActivityLogHeroProps) {
  const { t } = useTranslation();
  return (
    <div id="letter-hero-banner" className="bg-[#097939] p-5 sm:p-8 text-white relative">
      <div className="absolute right-6 bottom-4 text-white/5 font-black text-6xl tracking-widest leading-none pointer-events-none">
        HKBR
      </div>
      <div className="flex flex-col-reverse sm:flex-row justify-between items-start gap-4">
        <div className="space-y-2 flex-1 min-w-0">
          <span className="text-[10px] font-black bg-white/20 text-yellow-300 px-2.5 py-0.5 rounded-full tracking-widest uppercase">
            {t('clientView.heroBadge')}
          </span>
          <h2 className="text-xl font-bold font-display">{t('clientView.heroTitle', { name: petName })}</h2>
          <p className="text-xs text-emerald-50/80 font-medium font-sans">
            {t('clientView.heroSubtitle', { name: petName })}
          </p>
        </div>
        <div
          className="size-14 sm:size-16 rounded-full border-2 border-white bg-white/20 flex items-center justify-center text-yellow-200 font-black text-sm sm:text-base select-none shrink-0"
          title={petName}
        >
          {petName.substring(0, 2)}
        </div>
      </div>
    </div>
  );
}
