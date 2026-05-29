import { Check, X } from 'lucide-react';
import { Button } from '../../ui/button';
import { useTranslation } from '../../../lib/i18n';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PlanCardProps {
  badge?: string;
  badgeColor?: string;
  title: string;
  description: string;
  price: string;
  priceUnit?: string;
  priceNote?: string;
  features: PlanFeature[];
  ctaLabel: string;
  highlighted?: boolean;
  current?: boolean;
  disabled?: boolean;
}

export default function PlanCard({
  badge,
  badgeColor = 'bg-slate-100 text-slate-600',
  title,
  description,
  price,
  priceUnit,
  priceNote,
  features,
  ctaLabel,
  highlighted = false,
  current = false,
  disabled = false,
}: PlanCardProps) {
  const { t } = useTranslation();
  return (
    <div
      className={`relative flex flex-col rounded-3xl border p-6 transition-shadow ${
        disabled
          ? 'border-slate-100 bg-slate-50/50 opacity-60 cursor-not-allowed'
          : highlighted
            ? 'border-teal-200 bg-teal-50/30 shadow-lg ring-2 ring-teal-500/20'
            : 'border-slate-100 bg-white shadow-sm'
      }`}
    >
      {badge && (
        <span className={`absolute -top-3 left-5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${badgeColor}`}>
          {badge}
        </span>
      )}

      <div className="mb-4 space-y-1">
        <h3 className="text-base font-extrabold text-slate-800">{title}</h3>
        <p className="text-[11px] text-slate-400">{description}</p>
      </div>

      <div className="mb-5">
        <span className="text-2xl font-black text-slate-800">{price}</span>
        {priceUnit && <span className="ml-1 text-xs font-bold text-slate-400">{priceUnit}</span>}
        {priceNote && <p className="mt-0.5 text-[10px] text-slate-400">{priceNote}</p>}
      </div>

      <ul className="mb-6 flex-1 space-y-2.5">
        {features.map((feature) => (
          <li key={feature.text} className="flex items-start gap-2 text-xs">
            {feature.included ? (
              <Check className="mt-0.5 size-3.5 shrink-0 text-teal-500" />
            ) : (
              <X className="mt-0.5 size-3.5 shrink-0 text-slate-300" />
            )}
            <span className={feature.included ? 'font-semibold text-slate-600' : 'text-slate-400'}>{feature.text}</span>
          </li>
        ))}
      </ul>

      <Button
        variant={highlighted && !disabled ? 'default' : 'outline'}
        disabled={current || disabled}
        className={`w-full rounded-xl font-bold ${highlighted && !disabled ? 'bg-teal-600 hover:bg-teal-700' : ''} ${current || disabled ? 'opacity-60' : ''}`}
      >
        {disabled ? t('subscription.comingSoon') : ctaLabel}
      </Button>
    </div>
  );
}