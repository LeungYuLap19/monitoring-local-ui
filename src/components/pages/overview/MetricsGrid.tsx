/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { ChartContainer, type ChartConfig } from '../../ui/chart';
import { useTranslation } from '../../../lib/i18n';
import type { MetricsGridProps } from '../../../types';

const gaugeConfig: ChartConfig = { value: { label: 'Capacity', color: '#0d9488' } };

export default function MetricsGrid({
  onlineCameras = 8,
  totalCameras = 10,
  alertsToday = 0,
  isLoading = false,
}: MetricsGridProps) {
  const { t } = useTranslation();
  const cameraCapacity = totalCameras > 0 ? Math.round((onlineCameras / totalCameras) * 100) : 0;
  const gaugeData = [{ value: cameraCapacity, fill: '#0d9488' }];

  return (
    <section id="metrics-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">

      <Card className="p-6 rounded-2xl gap-0 transition-shadow hover:shadow-md">
        <CardContent className="p-0 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-400 tracking-wider">{t('overview.metrics.capacityLabel')}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative size-16 shrink-0">
              <ChartContainer config={gaugeConfig} className="size-16">
                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" startAngle={90} endAngle={-270} data={gaugeData}>
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background dataKey="value" cornerRadius={4} fill="#0d9488" />
                </RadialBarChart>
              </ChartContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-[13px] font-black text-slate-800 leading-none">{String(onlineCameras).padStart(2, '0')}</span>
                <span className="text-[9px] text-slate-400 border-t border-slate-100 mt-0.5 leading-none">{totalCameras || '-'}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="size-2 rounded-full bg-teal-500" />
                <span className="text-slate-500 font-medium">{t('overview.metrics.largeCage')} {onlineCameras}/{totalCameras || '-'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="size-2 rounded-full bg-amber-500" />
                <span className="text-slate-400 font-medium font-mono">{t('overview.metrics.luxSuite')} 0/10</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="p-6 rounded-2xl gap-0 transition-shadow hover:shadow-md">
        <CardContent className="p-0 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-400 tracking-wider">{t('overview.metrics.arrivingLabel')}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-800 font-display">1</span>
            <span className="text-sm font-semibold text-slate-500">{t('overview.metrics.petUnit')}</span>
          </div>
        </CardContent>
      </Card>


      <Card className="p-6 rounded-2xl gap-0 transition-shadow hover:shadow-md">
        <CardContent className="p-0 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-400 tracking-wider">{t('overview.metrics.departingLabel')}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-800 font-display">2</span>
            <span className="text-sm font-semibold text-slate-500">{t('overview.metrics.petUnit')}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="p-6 rounded-2xl gap-0 transition-shadow hover:shadow-md">
        <CardContent className="p-0 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-400 tracking-wider">{t('overview.metrics.alertsLabel')}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black font-display ${alertsToday ? 'text-rose-600' : 'text-emerald-600'}`}>
              {alertsToday ? alertsToday : t('overview.metrics.noAlerts')}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-teal-600 font-bold">
            <div className="size-2.5 rounded-full bg-teal-600 animate-ping shrink-0" />
            <span>{isLoading ? 'Loading PetMonitor telemetry...' : t('overview.metrics.aiDiagnosis')}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="p-6 rounded-2xl gap-0 transition-shadow hover:shadow-md">
        <CardContent className="p-0 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-400 tracking-wider">{t('overview.metrics.camerasLabel')}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-800 font-display">{onlineCameras}</span>
            <span className="text-sm font-semibold text-slate-400">/ {totalCameras || '-'} {t('overview.metrics.cameraUnit')}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>{t('overview.metrics.cameraMaintenance', { count: String(Math.max(totalCameras - onlineCameras, 0)) })}</span>
            <span className="text-teal-600 font-extrabold font-mono text-[10px]">{cameraCapacity}% LIVE</span>
          </div>
        </CardContent>
      </Card>

    </section>
  );
}
