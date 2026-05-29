import { useTranslation } from '../../../lib/i18n';

interface BehaviorSummaryCardsProps {
  stats?: Record<string, number>;
  isLoading: boolean;
}

const BEHAVIOR_COLORS: Record<string, string> = {
  eating: 'bg-amber-50 text-amber-700 border-amber-100',
  resting: 'bg-blue-50 text-blue-700 border-blue-100',
  active: 'bg-green-50 text-green-700 border-green-100',
  drinking: 'bg-cyan-50 text-cyan-700 border-cyan-100',
};

const DEFAULT_STYLE = 'bg-slate-50 text-slate-700 border-slate-100';

export default function BehaviorSummaryCards({ stats, isLoading }: BehaviorSummaryCardsProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats || Object.keys(stats).length === 0) {
    return (
      <div className="text-center py-8 text-sm text-slate-400">
        {t('clientView.events.empty')}
      </div>
    );
  }

  const entries = Object.entries(stats).sort(([, a], [, b]) => b - a);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {entries.map(([behavior, count]) => (
        <div
          key={behavior}
          className={`rounded-xl border p-4 ${BEHAVIOR_COLORS[behavior.toLowerCase()] ?? DEFAULT_STYLE}`}
        >
          <p className="text-xs font-semibold opacity-70 capitalize">{behavior}</p>
          <p className="text-2xl font-extrabold mt-1">{count}</p>
        </div>
      ))}
    </div>
  );
}
