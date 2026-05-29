import { useTranslation } from '../../../lib/i18n';
import { Button } from '../../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { AwsBehaviorEvent } from '../../../types/lib/monitoring';

interface BehaviorEventListProps {
  events?: AwsBehaviorEvent[];
  pagination?: { page: number; limit: number; total: number; totalPages: number };
  isLoading: boolean;
  page: number;
  onPageChange: (page: number) => void;
}

export default function BehaviorEventList({ events, pagination, isLoading, page, onPageChange }: BehaviorEventListProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 bg-slate-50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!events?.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
        <p className="text-sm text-slate-400">{t('clientView.events.empty')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
      <h3 className="text-sm font-bold text-slate-700">{t('clientView.events.title')}</h3>
      <div className="divide-y divide-slate-50">
        {events.map((event, i) => {
          const time = new Date(event.timestamp);
          const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const dateStr = time.toLocaleDateString([], { month: 'short', day: 'numeric' });
          return (
            <div key={`${event.timestamp}-${i}`} className="flex items-center gap-4 py-2.5">
              <span className="text-xs text-slate-400 w-20 shrink-0">{dateStr} {timeStr}</span>
              <span className="text-xs font-semibold text-slate-700 capitalize">{event.behavior}</span>
              <span className="text-[10px] text-slate-400 ml-auto">{event.did}</span>
            </div>
          );
        })}
      </div>
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-xs text-slate-500">
            {page} / {pagination.totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
