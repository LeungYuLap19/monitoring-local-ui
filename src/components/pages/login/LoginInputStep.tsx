import React from 'react';
import { Mail, Phone, ChevronDown } from 'lucide-react';
import { LoginInputStepProps } from '../../../types';
import { useTranslation } from '../../../lib/i18n';
import { Button } from '../../ui/button';

const REGION_CODES = [
  { code: '+852', label: 'HK +852' },
  { code: '+86', label: 'CN +86' },
  { code: '+886', label: 'TW +886' },
  { code: '+65', label: 'SG +65' },
  { code: '+81', label: 'JP +81' },
  { code: '+44', label: 'UK +44' },
  { code: '+1', label: 'US +1' },
];

export default function LoginInputStep({
  loginMethod,
  inputValue,
  regionCode,
  isSubmitting = false,
  onInputChange,
  onRegionCodeChange,
  onMethodChange,
  onSubmit,
}: LoginInputStepProps) {
  const { t } = useTranslation();
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => { onMethodChange('email'); onInputChange(''); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-colors ${
            loginMethod === 'email'
              ? 'bg-teal-600 text-white'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          <Mail className="size-3.5" />
          <span>{t('auth.emailTab')}</span>
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => { onMethodChange('phone'); onInputChange(''); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-colors ${
            loginMethod === 'phone'
              ? 'bg-teal-600 text-white'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          <Phone className="size-3.5" />
          <span>{t('auth.phoneTab')}</span>
        </button>
      </div>

      <div>
        {loginMethod === 'email' ? (
          <input
            type="email"
            value={inputValue}
            disabled={isSubmitting}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={t('auth.emailPlaceholder')}
            required
            className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
          />
        ) : (
          <div className="flex gap-2">
            <div className="relative shrink-0">
              <select
                value={regionCode}
                disabled={isSubmitting}
                onChange={(e) => onRegionCodeChange(e.target.value)}
                className="appearance-none h-full pl-3 pr-7 py-2.5 bg-slate-50 rounded-lg text-xs font-medium text-slate-700 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 cursor-pointer"
              >
                {REGION_CODES.map((r) => (
                  <option key={r.code} value={r.code}>{r.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
            </div>
            <input
              type="tel"
              value={inputValue}
              disabled={isSubmitting}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={t('auth.phonePlaceholder')}
              required
              className="flex-1 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
            />
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-teal-600 hover:bg-teal-700 font-semibold text-sm py-2.5"
      >
        {isSubmitting ? t('auth.loading') : t('auth.getOtp')}
      </Button>
    </form>
  );
}