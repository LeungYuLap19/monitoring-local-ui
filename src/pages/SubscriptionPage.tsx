import { useEffect, useState } from 'react';
import { CalendarDays, CreditCard, FileText, Loader2, XCircle } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { Button } from '../components/ui/button';
import PlanCard from '../components/pages/subscription/PlanCard';
import { getSubscription, type SubscriptionEntitlement } from '../lib/services/subscriptionService';

export default function SubscriptionPage() {
  const { t } = useTranslation();
  const [entitlement, setEntitlement] = useState<SubscriptionEntitlement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubscription()
      .then(setEntitlement)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const currentTier = entitlement?.tier ?? 'free';

  const plans = [
    {
      badge: t('subscription.plans.free.badge'),
      badgeColor: 'bg-emerald-100 text-emerald-700',
      title: t('subscription.plans.free.title'),
      description: t('subscription.plans.free.description'),
      price: t('subscription.plans.free.price'),
      priceUnit: '',
      priceNote: t('subscription.plans.free.priceNote'),
      ctaLabel: currentTier === 'free' ? t('subscription.current.currentPlan') : t('subscription.plans.free.cta'),
      highlighted: false,
      current: currentTier === 'free',
      features: [
        { text: t('subscription.features.liveCam1'), included: true },
        { text: t('subscription.features.behaviorAi'), included: true },
        { text: t('subscription.features.dailyLog'), included: true },
        { text: t('subscription.features.clips3days'), included: true },
        { text: t('subscription.features.multiCam'), included: false },
        { text: t('subscription.features.exportReport'), included: false },
        { text: t('subscription.features.prioritySupport'), included: false },
      ],
    },
    {
      title: t('subscription.plans.basic.title'),
      description: t('subscription.plans.basic.description'),
      price: t('subscription.plans.basic.price'),
      priceUnit: t('subscription.plans.basic.priceUnit'),
      priceNote: t('subscription.plans.basic.priceNote'),
      ctaLabel: currentTier === 'basic' ? t('subscription.current.currentPlan') : t('subscription.plans.basic.cta'),
      highlighted: false,
      current: currentTier === 'basic',
      disabled: currentTier !== 'basic',
      features: [
        { text: t('subscription.features.liveCam1'), included: true },
        { text: t('subscription.features.behaviorAi'), included: true },
        { text: t('subscription.features.dailyLog'), included: true },
        { text: t('subscription.features.clips7days'), included: true },
        { text: t('subscription.features.multiCam'), included: false },
        { text: t('subscription.features.exportReport'), included: true },
        { text: t('subscription.features.prioritySupport'), included: false },
      ],
    },
    {
      badge: t('subscription.plans.pro.badge'),
      badgeColor: 'bg-teal-100 text-teal-700',
      title: t('subscription.plans.pro.title'),
      description: t('subscription.plans.pro.description'),
      price: t('subscription.plans.pro.price'),
      priceUnit: t('subscription.plans.pro.priceUnit'),
      priceNote: t('subscription.plans.pro.priceNote'),
      ctaLabel: currentTier === 'pro' ? t('subscription.current.currentPlan') : t('subscription.plans.pro.cta'),
      highlighted: currentTier !== 'pro',
      current: currentTier === 'pro',
      disabled: currentTier !== 'pro',
      features: [
        { text: t('subscription.features.liveCam3'), included: true },
        { text: t('subscription.features.behaviorAi'), included: true },
        { text: t('subscription.features.dailyLog'), included: true },
        { text: t('subscription.features.clips30days'), included: true },
        { text: t('subscription.features.multiCam'), included: true },
        { text: t('subscription.features.exportReport'), included: true },
        { text: t('subscription.features.prioritySupport'), included: true },
      ],
    },
    {
      title: t('subscription.plans.travel.title'),
      description: t('subscription.plans.travel.description'),
      price: t('subscription.plans.travel.price'),
      priceUnit: t('subscription.plans.travel.priceUnit'),
      priceNote: t('subscription.plans.travel.priceNote'),
      ctaLabel: currentTier === 'travel' ? t('subscription.current.currentPlan') : t('subscription.plans.travel.cta'),
      highlighted: false,
      current: currentTier === 'travel',
      disabled: currentTier !== 'travel',
      features: [
        { text: t('subscription.features.liveCam1'), included: true },
        { text: t('subscription.features.behaviorAi'), included: true },
        { text: t('subscription.features.dailyLog'), included: true },
        { text: t('subscription.features.clips5days'), included: true },
        { text: t('subscription.features.multiCam'), included: false },
        { text: t('subscription.features.exportReport'), included: false },
        { text: t('subscription.features.prioritySupport'), included: false },
      ],
    },
  ];

  return (
    <div id="page-subscription" className="p-4 md:p-8 select-none space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-slate-400" />
        </div>
      ) : (
      <>
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                {t('subscription.current.badge')}
              </span>
            </div>
            <h2 className="text-base font-extrabold text-slate-800">{t(`subscription.plans.${currentTier}.title`)}</h2>
            <p className="text-xs text-slate-400">{entitlement?.status === 'active' ? t('subscription.current.active') : t('subscription.current.duration')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl">
              <FileText className="size-3.5" />
              {t('subscription.billingHistory')}
            </Button>
            {currentTier !== 'free' && (
              <Button variant="outline" size="sm" className="gap-2 rounded-xl border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600">
                <XCircle className="size-3.5" />
                {t('subscription.current.cancel')}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <CalendarDays className="size-4 text-teal-600 shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('subscription.current.startLabel')}</p>
              <p className="text-xs font-bold text-slate-700">{entitlement?.startedAt ? new Date(entitlement.startedAt).toLocaleDateString() : '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <CalendarDays className="size-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('subscription.current.endLabel')}</p>
              <p className="text-xs font-bold text-slate-700">{entitlement?.endsAt ? new Date(entitlement.endsAt).toLocaleDateString() : '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <CreditCard className="size-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('subscription.current.billingLabel')}</p>
              <p className="text-xs font-bold text-slate-700">{t('subscription.current.billingNone')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-800">
          {t('subscription.title')}
        </h1>
        <p className="text-xs text-slate-400">{t('subscription.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <PlanCard key={plan.title} {...plan} />
        ))}
      </div>

      <p className="text-center text-[10px] text-slate-400">
        {t('subscription.disclaimer')}
      </p>
      </>
      )}
    </div>
  );
}
