import React from 'react';
import { Sparkles, User } from 'lucide-react';
import { LoginRegisterStepProps } from '../../../types';
import { useTranslation } from '../../../lib/i18n';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

export default function LoginRegisterStep({
  inputValue,
  firstName,
  lastName,
  isSubmitting = false,
  onFirstNameChange,
  onLastNameChange,
  onSubmit,
  onBack,
}: LoginRegisterStepProps) {
  const { t } = useTranslation();
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100/70 space-y-3">
        <div className="flex items-center gap-1.5 text-teal-800">
          <Sparkles className="size-4 shrink-0 text-teal-600 animate-pulse" />
          <span className="text-xs font-black">{t('auth.registerTitle')}</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-normal font-medium">
          {t('auth.registerWelcome')} (<span className="font-mono text-teal-900 font-bold">{inputValue}</span>)
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 pb-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              {t('auth.lastNameLabel')}
            </Label>
            <Input
              type="text"
              required
              disabled={isSubmitting}
              value={lastName}
              onChange={(e) => onLastNameChange(e.target.value)}
              placeholder={t('auth.lastNamePlaceholder')}
              className="px-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-800 shadow-inner"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              {t('auth.firstNameLabel')}
            </Label>
            <Input
              type="text"
              required
              disabled={isSubmitting}
              value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              placeholder={t('auth.firstNamePlaceholder')}
              className="px-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-800 shadow-inner"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-lg bg-teal-600 hover:bg-teal-700 font-semibold text-sm"
        >
          <User className="size-4" />
          <span>{isSubmitting ? t('auth.loading') : t('auth.registerSubmit')}</span>
        </Button>

        <Button
          type="button"
          variant="secondary"
          disabled={isSubmitting}
          onClick={onBack}
          className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-150 py-3"
        >
          {t('auth.registerCancel')}
        </Button>
      </div>
    </form>
  );
}
