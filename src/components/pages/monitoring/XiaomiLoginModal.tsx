import { useRef, KeyboardEvent, ClipboardEvent } from 'react';
import { Loader2, Mail, Video, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { useXiaomiLogin } from '../../../hooks/monitoring/useXiaomiLogin';
import { useTranslation } from '../../../lib/i18n';

const REGIONS = [
  { value: 'sg', label: 'Hong Kong / Singapore' },
  { value: 'cn', label: 'China Mainland' },
  { value: 'de', label: 'Europe' },
  { value: 'us', label: 'United States' },
];

interface XiaomiLoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onStatusChange?: () => void;
}

export default function XiaomiLoginModal({ open, onClose, onSuccess, onStatusChange }: XiaomiLoginModalProps) {
  const { t } = useTranslation();
  const login = useXiaomiLogin({ onSuccess, onStatusChange });

  const handleClose = () => {
    login.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2">
            <Video className="size-5 text-teal-600" />
            {t('xiaomi.title')}
          </DialogTitle>
          <DialogDescription>{t('xiaomi.description')}</DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {login.error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600 font-medium">
              {login.error}
            </div>
          )}

          {login.step === 'credentials' && (
            <CredentialsStep login={login} />
          )}
          {login.step === 'verify' && (
            <VerifyStep login={login} />
          )}
          {login.step === 'cameras' && (
            <CamerasStep login={login} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function VerifyStep({ login }: { login: ReturnType<typeof useXiaomiLogin> }) {
  const { t } = useTranslation();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => login.verifyCode[i] || '');

  const focusInput = (index: number) => {
    if (index >= 0 && index < 6) inputRefs.current[index]?.focus();
  };

  const updateOtp = (value: string) => {
    login.setVerifyCode(value.replace(/[^0-9]/g, '').slice(0, 6));
  };

  const handleInput = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, '');
    if (!digit) return;
    const newDigits = [...digits];
    newDigits[index] = digit[0];
    updateOtp(newDigits.join(''));
    if (index < 5) focusInput(index + 1);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newDigits = [...digits];
      if (digits[index]) {
        newDigits[index] = '';
        updateOtp(newDigits.join(''));
      } else if (index > 0) {
        newDigits[index - 1] = '';
        updateOtp(newDigits.join(''));
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
      updateOtp(pasted);
      focusInput(Math.min(pasted.length, 5));
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); login.verify(); }} className="space-y-3">
      <div className="rounded-xl bg-teal-50 border border-teal-100 px-3 py-2 text-xs text-teal-700 font-medium">
        {t('xiaomi.verifyHint')}
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600">{t('xiaomi.verifyCode')}</label>
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
              disabled={login.loading}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className="h-16 text-center font-mono text-lg font-bold text-slate-800 border-slate-200 focus:border-teal-400"
            />
          ))}
        </div>
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={login.loading || login.verifyCode.length < 6}
      >
        {login.loading ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
        {t('xiaomi.verify')}
      </Button>
    </form>
  );
}

function CamerasStep({ login }: { login: ReturnType<typeof useXiaomiLogin> }) {
  const { t } = useTranslation();
  const atLimit = login.selectedDeviceIds.size >= login.cameraLimit;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">{t('xiaomi.selectCameras')}</p>
        {login.cameraLimit < Infinity && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${atLimit ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
            {login.selectedDeviceIds.size}/{login.cameraLimit}
          </span>
        )}
      </div>
      <div className="max-h-60 overflow-y-auto space-y-2">
        {login.sources.map((cam) => {
          const did = cam.did ?? cam.url.match(/[?&]did=(\d+)/)?.[1] ?? '';
          const selected = did ? login.selectedDeviceIds.has(did) : false;
          const disabled = !selected && atLimit;
          return (
            <button
              key={cam.url}
              type="button"
              onClick={() => did && login.toggleCamera(did)}
              disabled={disabled || !did}
              className={`w-full text-left rounded-xl border p-3 transition-colors ${
                selected
                  ? 'border-teal-300 bg-teal-50'
                  : disabled || !did
                    ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                    : 'border-slate-100 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-700">{cam.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{cam.info}</p>
                </div>
                {selected && (
                  <Check className="size-4 text-teal-600 shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>
      {atLimit && login.cameraLimit < Infinity && (
        <p className="text-[10px] text-amber-600 font-medium">{t('xiaomi.cameraLimitReached')}</p>
      )}
      <Button
        className="w-full"
        onClick={login.addCameras}
        disabled={login.loading || login.selectedDeviceIds.size === 0}
      >
        {login.loading ? <Loader2 className="size-4 animate-spin" /> : <Video className="size-4" />}
        {t('xiaomi.addCameras')} ({login.selectedDeviceIds.size})
      </Button>
    </div>
  );
}

function CredentialsStep({ login }: { login: ReturnType<typeof useXiaomiLogin> }) {
  const { t } = useTranslation();
  return (
    <form onSubmit={(e) => { e.preventDefault(); login.requestCode(); }} className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600">{t('xiaomi.username')}</label>
        <Input
          value={login.username}
          onChange={(e) => login.setUsername(e.target.value)}
          placeholder={t('xiaomi.usernamePlaceholder')}
          autoComplete="username"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600">{t('xiaomi.password')}</label>
        <Input
          type="password"
          value={login.password}
          onChange={(e) => login.setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600">{t('xiaomi.region')}</label>
        <select
          value={login.region}
          onChange={(e) => login.setRegion(e.target.value)}
          className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white"
        >
          {REGIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>
      <Button
        type="submit"
        className="w-full mt-2"
        disabled={login.loading || !login.username || !login.password}
      >
        {login.loading ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
        {t('xiaomi.sendCode')}
      </Button>
    </form>
  );
}
