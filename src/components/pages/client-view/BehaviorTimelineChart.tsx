import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from '../../../lib/i18n';
import type { AwsBehaviorTimelinePoint } from '../../../types/lib/monitoring';

interface BehaviorTimelineChartProps {
  points?: AwsBehaviorTimelinePoint[];
  bucket: string;
  isLoading: boolean;
}

const COLORS = ['#0d9488', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981'];

export default function BehaviorTimelineChart({ points, isLoading }: BehaviorTimelineChartProps) {
  const { t } = useTranslation();

  const { chartData, behaviors } = useMemo(() => {
    if (!points?.length) return { chartData: [], behaviors: [] };
    const behaviorSet = new Set<string>();
    const data = points.map((p) => {
      Object.keys(p.counts).forEach((b) => behaviorSet.add(b));
      return { label: p.label, ...p.counts };
    });
    return { chartData: data, behaviors: [...behaviorSet] };
  }, [points]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="h-48 bg-slate-50 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
        <p className="text-sm text-slate-400">{t('clientView.events.empty')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-3">
      <h3 className="text-sm font-bold text-slate-700">{t('clientView.timeline.title')}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          {behaviors.map((b, i) => (
            <Area
              key={b}
              type="monotone"
              dataKey={b}
              stackId="1"
              stroke={COLORS[i % COLORS.length]}
              fill={COLORS[i % COLORS.length]}
              fillOpacity={0.4}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
