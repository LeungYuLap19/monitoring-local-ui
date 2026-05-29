import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../lib/i18n';
import { createOtpChallenge, registerUserFromOtp, verifyOtpChallenge, bootstrapSessionWithToken } from '../../lib/services/authService';
import { isAuthApiError } from '../../lib/utils/auth';
import { validateEmail, validatePhone } from '../../lib/utils/validation';
import type { LoginMethod } from '../../types/lib/auth';
import type { AuthAction, AuthStep } from '../../types';

export function useAuth(showToast: (msg: string) => void) {
  const { t, locale } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<AuthStep>('input');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [regionCode, setRegionCode] = useState('+852');
  const [inputValue, setInputValue] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const getErrorMessage = (error: unknown, action: AuthAction): string => {
    if (!isAuthApiError(error)) {
      return t('auth.errors.generic');
    }

    switch (error.errorKey) {
      case 'common.rateLimited':
        return t('auth.errors.rateLimited');
      case 'auth.challenge.verificationFailed':
      case 'auth.challenge.codeIncorrect':
        return t('auth.errors.wrongOtp');
      case 'auth.challenge.codeExpired':
        return t('auth.errors.verificationExpired');
      case 'auth.registration.user.verificationRequired':
        return t('auth.errors.verificationExpired');
      case 'auth.challenge.emailServiceUnavailable':
      case 'auth.challenge.smsServiceUnavailable':
        return t('auth.errors.serviceUnavailable');
      case 'auth.refresh.invalidSession':
      case 'auth.refresh.invalidRefreshTokenCookie':
      case 'auth.refresh.missingRefreshToken':
        return t('auth.errors.sessionExpired');
      case 'common.invalidBodyParams':
        if (action === 'challenge') {
          return loginMethod === 'email' ? t('auth.errors.invalidEmail') : t('auth.errors.invalidPhone');
        }
        if (action === 'verify') {
          return t('auth.errors.wrongOtp');
        }
        return t('auth.errors.generic');
      default:
        if (error.status === 0) {
          return t('auth.errors.network');
        }
        return error.message || t('auth.errors.generic');
    }
  };

  const handleSendOtp = async (e?: FormEvent) => {
    e?.preventDefault();

    if (!inputValue.trim()) {
      showToast(loginMethod === 'email' ? t('auth.errors.emptyEmail') : t('auth.errors.emptyPhone'));
      return;
    }
    if (loginMethod === 'email' && !validateEmail(inputValue)) {
      showToast(t('auth.errors.invalidEmail'));
      return;
    }
    if (loginMethod === 'phone' && !validatePhone(inputValue)) {
      showToast(t('auth.errors.invalidPhone'));
      return;
    }

    setIsSubmitting(true);
    try {
      await createOtpChallenge({
        loginMethod,
        inputValue,
        regionCode,
        locale,
      });
      setStep('otp');
      setEnteredOtp('');
      setTimer(60);
      showToast(t('auth.toasts.otpSent'));
    } catch (error) {
      showToast(getErrorMessage(error, 'challenge'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();

    if (!enteredOtp.trim()) {
      showToast(t('auth.errors.emptyOtp'));
      return;
    }
    if (!/^\d{6}$/.test(enteredOtp.trim())) {
      showToast(t('auth.errors.wrongOtp'));
      return;
    }

    setIsSubmitting(true);
    try {
      const verifyResult = await verifyOtpChallenge({
        loginMethod,
        inputValue,
        regionCode,
        code: enteredOtp.trim(),
        locale,
      });

      if (verifyResult.isNewUser) {
        setStep('register');
        showToast(t('auth.toasts.otpVerified'));
        return;
      }

      if (!verifyResult.token) {
        showToast(t('auth.errors.generic'));
        return;
      }

      const user = await bootstrapSessionWithToken(verifyResult.token, verifyResult.role);
      showToast(
        t('auth.toasts.welcomeBack', {
          name: `${user.lastName ?? ''}${user.firstName ?? ''}` || user.emailOrPhone || 'User',
        }),
      );
      navigate('/', { replace: true });
    } catch (error) {
      showToast(getErrorMessage(error, 'verify'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterAndLogin = async (e: FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      showToast(t('auth.errors.emptyName'));
      return;
    }

    setIsSubmitting(true);
    try {
      const registrationResult = await registerUserFromOtp({
        loginMethod,
        inputValue,
        regionCode,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      const user = await bootstrapSessionWithToken(registrationResult.token, registrationResult.role);
      showToast(
        t('auth.toasts.registered', {
          name: `${user.lastName ?? ''}${user.firstName ?? ''}` || `${lastName.trim()}${firstName.trim()}`,
        }),
      );
      navigate('/', { replace: true });
    } catch (error) {
      showToast(getErrorMessage(error, 'register'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToInput = () => {
    if (isSubmitting) return;
    setStep('input');
    setEnteredOtp('');
    setTimer(0);
  };

  return {
    step, loginMethod, setLoginMethod,
    regionCode, setRegionCode,
    inputValue, setInputValue,
    enteredOtp, setEnteredOtp,
    timer, firstName, setFirstName,
    lastName, setLastName,
    isSubmitting,
    handleSendOtp, handleVerifyOtp,
    handleRegisterAndLogin, handleBackToInput,
  };
}
