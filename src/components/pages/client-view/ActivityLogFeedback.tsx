import React from 'react';
import { Heart } from 'lucide-react';
import { ActivityLogFeedbackProps } from '../../../types';
import { useTranslation } from '../../../lib/i18n';

export default function ActivityLogFeedback({
  liked,
  onToggleLike,
}: ActivityLogFeedbackProps) {
  const { t } = useTranslation();
  return (
    <div id="parent-letter-feedback-block" className="p-4 sm:p-8 bg-slate-50 border-t border-slate-100 select-none">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h4 className="font-bold text-sm text-slate-700">{t('clientView.feedbackTitle')}</h4>
          <p className="text-xs text-slate-400 font-medium">{t('clientView.feedbackSubtitle')}</p>
        </div>

        <button
          onClick={onToggleLike}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            liked
              ? 'bg-rose-500 text-white shadow shadow-rose-200'
              : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Heart className={`size-4 ${liked ? 'fill-current' : ''}`} />
          <span>{liked ? t('clientView.liked') : t('clientView.likeBtn')}</span>
        </button>
      </div>
    </div>
  );
}
