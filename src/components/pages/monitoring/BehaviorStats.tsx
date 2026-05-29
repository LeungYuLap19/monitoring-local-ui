import React, { useMemo } from 'react';
import { AlertTriangle, ChevronDown, FileText, RefreshCw, Sparkles, TrendingUp, TrendingDown, Clock, Utensils, Activity, AlertCircle } from 'lucide-react';
import { BehaviorStatsProps } from '../../../types';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '../../ui/chart';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { useTranslation } from '../../../lib/i18n';
import { formatBehaviorDuration } from '../../../lib/utils/services/pet-monitor-ui';

export default function BehaviorStats({
  timeFilter,
  setTimeFilter,
  summary,
  avgOver3Days,
  statsByTime,
  trendStatsByTime,
  activeCategory,
  totalActivities,
  onGenerateLog,
  onRefresh,
  isLoading = false,
  error = null,
  placeholder = null,
}: BehaviorStatsProps) {
  const { t } = useTranslation();

  const barChartConfig: ChartConfig = {
    activityCount: { label: timeFilter === '1' ? t('monitoring.stats.countAxis') : t('monitoring.stats.perDay'), color: '#0d9488' },
  };

  const barData = statsByTime.map((item, idx) => ({
    date: item.date,
    activityCount: item.activityCount,
    fill: idx === statsByTime.length - 1 ? '#0d9488' : '#cbd5e1',
  }));

  const pieData = activeCategory.map((cat) => ({
    name: t(cat.label),
    value: cat.value,
    fill: cat.color,
  }));

  const pieChartConfig: ChartConfig = activeCategory.reduce((acc, cat) => {
    acc[t(cat.label)] = { label: t(cat.label), color: cat.color };
    return acc;
  }, {} as ChartConfig);

  const todayTotal = statsByTime.reduce((sum, item) => sum + item.activityCount, 0);
  const todayStats = statsByTime[statsByTime.length - 1];
  const trendData = trendStatsByTime;

  const insights = useMemo(() => {
    const dominant = activeCategory.length
      ? activeCategory.reduce((a, b) => (b.value > a.value ? b : a), activeCategory[0])
      : null;

    let peakLabel: string | null = null;
    if (statsByTime.length > 1) {
      let maxTotal = 0;
      let maxIdx = 0;
      statsByTime.forEach((s, i) => {
        const total = s.eatingCount + s.drinkingCount + s.activityCount + s.restingCount;
        if (total > maxTotal) { maxTotal = total; maxIdx = i; }
      });
      if (maxTotal > 0) {
        peakLabel = timeFilter === '1'
          ? `${statsByTime[maxIdx].date}:00`
          : statsByTime[maxIdx].date;
      }
    }

    const eatingSeconds = activeCategory.find((c) => c.label.includes('eating'))?.value ?? 0;
    const drinkingSeconds = activeCategory.find((c) => c.label.includes('drinking'))?.value ?? 0;
    let alert: string | null = null;
    let alertLevel: 'warning' | 'ok' = 'ok';
    if (totalActivities > 0 && eatingSeconds === 0) { alert = t('monitoring.insights.noEating'); alertLevel = 'warning'; }
    else if (totalActivities > 0 && drinkingSeconds === 0) { alert = t('monitoring.insights.noDrinking'); alertLevel = 'warning'; }
    else { alert = t('monitoring.insights.allNormal'); }

    let comparison: { pct: number; direction: 'up' | 'down' | 'same' } | null = null;
    if (avgOver3Days > 0 && totalActivities > 0) {
      const pct = Math.round(((totalActivities - avgOver3Days) / avgOver3Days) * 100);
      comparison = { pct: Math.abs(pct), direction: pct > 0 ? 'up' : pct < 0 ? 'down' : 'same' };
    }

    return { dominant, peakLabel, alert, alertLevel, comparison };
  }, [activeCategory, statsByTime, timeFilter, totalActivities, avgOver3Days, t]);

  const lineChartConfig: ChartConfig = {
    restingCount: { label: t('monitoring.behavior.resting'), color: '#94a3b8' },
    eatingCount: { label: t('monitoring.behavior.eating'), color: '#0d9488' },
    drinkingCount: { label: t('monitoring.behavior.drinking'), color: '#10b981' },
    activityCount: { label: t('monitoring.behavior.active'), color: '#f59e0b' },
  };

  return (
    <div id="monitoring-right" className="col-span-1 lg:col-span-4 space-y-6">
      <Card className="p-6 rounded-2xl gap-0">
        <CardContent className="p-0 space-y-12">
          <div className="flex justify-between items-start">
            <h4 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <Sparkles className="size-4 text-teal-600" />
              <span>{t('monitoring.stats.title')}</span>
            </h4>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                title={t('monitoring.stats.refresh')}
              >
                <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>

          {!placeholder && totalActivities > 0 && (
            <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3">
              {insights.dominant && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Activity className="size-4 text-teal-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{t('monitoring.insights.dominantLabel')}</p>
                    <p className="text-xs font-bold text-slate-700 truncate">{t(insights.dominant.label)} · {formatBehaviorDuration(insights.dominant.value)}</p>
                  </div>
                </div>
              )}
              {insights.peakLabel && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Clock className="size-4 text-amber-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{t(timeFilter === '1' ? 'monitoring.insights.peakHourLabel' : 'monitoring.insights.peakDayLabel')}</p>
                    <p className="text-xs font-bold text-slate-700">{insights.peakLabel}</p>
                  </div>
                </div>
              )}
              {insights.alert && (
                <div className={`flex items-center gap-2.5 p-3 rounded-xl border ${insights.alertLevel === 'warning' ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
                  <AlertCircle className={`size-4 shrink-0 ${insights.alertLevel === 'warning' ? 'text-amber-600' : 'text-emerald-500'}`} />
                  <div className="min-w-0">
                    <p className={`text-[10px] font-bold uppercase ${insights.alertLevel === 'warning' ? 'text-amber-500' : 'text-emerald-400'}`}>{t('monitoring.insights.alertLabel')}</p>
                    <p className={`text-xs font-bold truncate ${insights.alertLevel === 'warning' ? 'text-amber-700' : 'text-emerald-700'}`}>{insights.alert}</p>
                  </div>
                </div>
              )}
              {insights.comparison && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  {insights.comparison.direction === 'up'
                    ? <TrendingUp className="size-4 text-emerald-500 shrink-0" />
                    : <TrendingDown className="size-4 text-rose-500 shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{t('monitoring.insights.comparisonLabel')}</p>
                    <p className="text-xs font-bold text-slate-700">
                      {insights.comparison.direction === 'up' ? '↑' : '↓'}{insights.comparison.pct}% {t('monitoring.insights.vsAverage')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {placeholder ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center space-y-3">
              <AlertTriangle className="size-8 text-amber-500 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-extrabold text-slate-700">{placeholder.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{placeholder.message}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <span className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">{t('monitoring.stats.distributionLabel')}</span>
                <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-stretch xl:flex-row xl:items-center">
                  <ChartContainer config={pieChartConfig} className="size-[100px] shrink-0 lg:w-full lg:h-[120px] xl:size-[100px]">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={28} outerRadius={42} strokeWidth={2}>
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 min-w-0 select-none">
                    {activeCategory.map((cat, idx) => (
                      <div key={idx} className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="size-2.5 rounded-md shrink-0 block" style={{ backgroundColor: cat.color }} />
                          <span className="text-xs font-bold text-slate-600 truncate">{t(cat.label)}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold pl-4 truncate">{formatBehaviorDuration(cat.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">{t(`monitoring.stats.avgLabel${timeFilter}`)}</span>
                  <div className="relative">
                    <select
                      id="stats-time-filter"
                      value={timeFilter}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTimeFilter(e.target.value as '1' | '3' | '7')}
                      className="appearance-none bg-slate-50 rounded-lg px-3 py-1 pr-6 text-[10px] font-extrabold text-slate-500 focus:outline-none cursor-pointer"
                    >
                      <option value="1">{t('monitoring.stats.filter1Day')}</option>
                      <option value="3">{t('monitoring.stats.filter3Days')}</option>
                      <option value="7">{t('monitoring.stats.filter7Days')}</option>
                    </select>
                    <ChevronDown className="size-3 text-slate-400 absolute right-1.5 top-2 pointer-events-none" />
                  </div>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-0.5">
                      <span className="block text-2xl font-black text-slate-800 tracking-tight">
                        {formatBehaviorDuration(timeFilter === '1' ? todayTotal : (todayStats?.activityCount ?? 0))} <span className="text-[10px] text-slate-400 font-bold">{t('monitoring.stats.perToday')}</span>
                      </span>
                      {timeFilter === '1' ? (
                        <span className="text-[10px] text-slate-400 font-bold">{t('monitoring.stats.yesterdayAvg')} {statsByTime.length ? Math.round(todayTotal / statsByTime.length) : 0}{t('monitoring.stats.perHour')}</span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold">{timeFilter}-day {t('monitoring.stats.yesterdayAvg')} {avgOver3Days}{t('monitoring.stats.perDay')}</span>
                      )}
                    </div>
                  </div>
                  <ChartContainer config={barChartConfig} className="h-[100px] w-full">
                    <BarChart data={barData} margin={{ top: 15, right: 0, left: 0, bottom: 0 }}>
                      <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="activityCount" radius={[4, 4, 0, 0]} fill="#0d9488">
                        {barData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </div>
              </div>

              <div className="space-y-4">
                <span className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">{t(`monitoring.stats.comparisonLabel${timeFilter}`)}</span>
                <ChartContainer config={lineChartConfig} className="h-[120px] w-full">
                  <LineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      label={{ value: t('monitoring.stats.countAxis'), angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
                      tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="restingCount" stroke="var(--color-restingCount)" strokeWidth={1.75} dot={false} />
                    <Line type="monotone" dataKey="eatingCount" stroke="var(--color-eatingCount)" strokeWidth={1.75} dot={false} />
                    <Line type="monotone" dataKey="drinkingCount" stroke="var(--color-drinkingCount)" strokeWidth={1.75} dot={false} />
                    <Line type="monotone" dataKey="activityCount" stroke="var(--color-activityCount)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ChartContainer>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] font-bold text-slate-400">
                  {Object.entries(lineChartConfig).map(([key, config]) => (
                    <div key={key} className="flex items-center gap-1 min-w-0">
                      <span className="w-2.5 h-0.5 shrink-0 inline-block" style={{ backgroundColor: config.color }} />
                      <span className="truncate">{config.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Button
            id="generate-daily-log-btn"
            onClick={onGenerateLog}
            className="w-full py-3 group"
            disabled={Boolean(placeholder) || totalActivities === 0}
          >
            <FileText className="size-4 shrink-0 transition-transform group-hover:-translate-y-0.5" />
            <span>{t('monitoring.stats.generateLog')}</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
