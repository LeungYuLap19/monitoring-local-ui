import { ActivityLogStatsProps } from '../../../types';
import { useTranslation } from '../../../lib/i18n';
import { Bar, BarChart, XAxis, YAxis, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '../../ui/chart';

export default function ActivityLogStats({ activityCounts }: ActivityLogStatsProps) {
  const { t } = useTranslation();

  const chartData = activityCounts.map((item) => ({
    name: item.label.includes('.') ? t(item.label) : item.label,
    value: item.value,
    fill: item.color,
  }));

  const chartConfig: ChartConfig = activityCounts.reduce((acc, item) => {
    const label = item.label.includes('.') ? t(item.label) : item.label;
    acc[label] = { label, color: item.color };
    return acc;
  }, {} as ChartConfig);

  return (
    <div className="bg-slate-50/20 p-6 rounded-2xl space-y-4">
      <span className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">{t('clientView.statsLabel')}</span>

      <ChartContainer config={chartConfig} className="h-[140px] w-full">
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 60, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} width={60} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={10}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
