import { useRef, KeyboardEvent, ClipboardEvent } from 'react';
import { LogIn } from 'lucide-react';
import { LoginOtpStepProps } from '../../../types';
import { useTranslation } from '../../../lib/i18n';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

export default function LoginOtpStep({
  inputValue,
  enteredOtp,
  onOtpChange,
  isSubmitting = false,
  timer,
  onResend,
  onVerify,
  onBack,
}: LoginOtpStepProps) {
  const { t } = useTranslation();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => enteredOtp[i] || '');

  const focusInput = (index: number) => {
    if (index >= 0 && index < 6) inputRefs.current[index]?.focus();
  };

  const updateDigit = (index: number, value: string) => {
    const newDigits = [...digits];
    newDigits[index] = value;
    onOtpChange(newDigits.join('').replace(/[^0-9]/g, ''));
  };

  const handleInput = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, '');
    if (!digit) return;
    updateDigit(index, digit[0]);
    if (index < 5) focusInput(index + 1);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[index]) {
        updateDigit(index, '');
      } else if (index > 0) {
        updateDigit(index - 1, '');
        focusInput(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1);
    } else if (e.key === 'ArrowRight' && index < 5) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pasted) {
      onOtpChange(pasted);
      focusInput(Math.min(pasted.length, 5));
    }
  };

  return (
    <form onSubmit={onVerify} className="space-y-6">
      <div className="bg-teal-50/50 rounded-2xl border border-teal-100 p-4 space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black uppercase text-teal-700 tracking-wider">
            {t('auth.otpSentTo')}
          </span>
          <Button
            type="button"
            variant="link"
            onClick={onBack}
            className="text-[10px] text-teal-600 hover:underline font-extrabold h-auto p-0"
          >
            {t('auth.changeInput')}
          </Button>
        </div>
        <p className="text-xs font-bold text-teal-900 truncate font-mono">
          {inputValue}
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
          {t('auth.otpLabel')}
        </Label>

        <div className="grid grid-cols-6 gap-2">
          {digits.map((digit, i) => (
            <Input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              autoFocus={i === 0}
              disabled={isSubmitting}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className="h-16 text-center font-mono text-lg font-bold text-slate-800 border-slate-200 focus:border-teal-400"
            />
          ))}
        </div>

        <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 px-1">
          <span>{t('auth.otpHint')}</span>
          {timer > 0 ? (
            <span>{t('auth.resendOtp')} ({timer}s)</span>
          ) : (
            <Button
              type="button"
              variant="link"
              disabled={isSubmitting}
              onClick={onResend}
              className="text-teal-600 font-black text-[10px] h-auto p-0"
            >
              {t('auth.resendOtp')}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-lg bg-teal-600 hover:bg-teal-700 font-semibold text-sm"
        >
          <LogIn className="size-4" />
          <span>{isSubmitting ? t('auth.loading') : t('auth.verifyOtp')}</span>
        </Button>

        <Button
          type="button"
          variant="secondary"
          disabled={isSubmitting}
          onClick={onBack}
          className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-150 py-3"
        >
          {t('auth.backToInput')}
        </Button>
      </div>
    </form>
  );
}
