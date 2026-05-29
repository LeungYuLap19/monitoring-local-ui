import React, { useState } from 'react';
import PHealthIcon from '../components/global/PHealthIcon';
import LanguageSwitcher from '../components/global/LanguageSwitcher';
import ppcIcon from '../assets/icons/ppc.png';
import LoginInputStep from '../components/pages/login/LoginInputStep';
import LoginOtpStep from '../components/pages/login/LoginOtpStep';
import LoginRegisterStep from '../components/pages/login/LoginRegisterStep';
import { useAuth } from '../hooks/auth';
import { useNgoAuth } from '../hooks/auth/useNgoAuth';
import { useTranslation } from '../lib/i18n';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';

export default function LoginPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'user' | 'ngo'>('user');
  const showToast = (message: string) => toast.success(message);
  const {
    step, loginMethod, setLoginMethod,
    regionCode, setRegionCode,
    inputValue, setInputValue,
    enteredOtp, setEnteredOtp,
    timer, firstName, setFirstName,
    lastName, setLastName,
    isSubmitting,
    handleSendOtp, handleVerifyOtp,
    handleRegisterAndLogin, handleBackToInput,
  } = useAuth(showToast);
  const ngo = useNgoAuth();

  return (
    <div id="page-login" className="min-h-screen flex select-none">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-500 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="relative z-10">
          <PHealthIcon size="small" />
        </div>
        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-bold text-white leading-tight">
            {t('auth.brandHeading') || 'Monitor. Manage. Protect.'}
          </h2>
          <p className="text-sm text-teal-100 leading-relaxed max-w-sm">
            {t('auth.brandSubheading') || 'A unified platform for pet health monitoring, profile management, and NGO coordination.'}
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-2">
          <p className="text-xs text-teal-200/60">Pet Pet Club Limited</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-6 lg:p-8">
          <div className="lg:hidden"><PHealthIcon size="small" /></div>
          <div className="ml-auto"><LanguageSwitcher /></div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-sm space-y-8">
            {/* Tab switcher */}
            <div className="flex gap-6 border-b border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('user')}
                className={`pb-3 text-sm font-semibold transition-colors ${activeTab === 'user' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {t('auth.tabs.user')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ngo')}
                className={`pb-3 text-sm font-semibold transition-colors ${activeTab === 'ngo' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {t('auth.tabs.ngo')}
              </button>
            </div>

            {activeTab === 'user' && (
              <div key="user" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {t('auth.signInTitle')}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">{t('auth.signInSubtitle')}</p>
                </div>

                {step === 'input' && (
                  <LoginInputStep
                    loginMethod={loginMethod}
                    inputValue={inputValue}
                    regionCode={regionCode}
                    isSubmitting={isSubmitting}
                    onInputChange={setInputValue}
                    onRegionCodeChange={setRegionCode}
                    onMethodChange={setLoginMethod}
                    onSubmit={handleSendOtp}
                  />
                )}

                {step === 'otp' && (
                  <LoginOtpStep
                    inputValue={inputValue}
                    enteredOtp={enteredOtp}
                    isSubmitting={isSubmitting}
                    onOtpChange={setEnteredOtp}
                    timer={timer}
                    onResend={() => handleSendOtp()}
                    onVerify={handleVerifyOtp}
                    onBack={handleBackToInput}
                  />
                )}

                {step === 'register' && (
                  <LoginRegisterStep
                    inputValue={inputValue}
                    firstName={firstName}
                    lastName={lastName}
                    isSubmitting={isSubmitting}
                    onFirstNameChange={setFirstName}
                    onLastNameChange={setLastName}
                    onSubmit={handleRegisterAndLogin}
                    onBack={handleBackToInput}
                  />
                )}
              </div>
            )}

            {activeTab === 'ngo' && (
              <div key="ngo" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {t('auth.ngo.signInTitle')}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">{t('auth.ngo.signInSubtitle')}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1.5 block">{t('auth.ngo.emailLabel')}</label>
                    <input
                      type="email"
                      value={ngo.email}
                      onChange={(e) => ngo.setEmail(e.target.value)}
                      placeholder={t('auth.ngo.emailPlaceholder')}
                      className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1.5 block">{t('auth.ngo.passwordLabel')}</label>
                    <input
                      type="password"
                      value={ngo.password}
                      onChange={(e) => ngo.setPassword(e.target.value)}
                      placeholder={t('auth.ngo.passwordPlaceholder')}
                      onKeyDown={(e) => { if (e.key === 'Enter') void ngo.handleLogin(); }}
                      className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                    />
                  </div>
                </div>

                {ngo.error && (
                  <p className="text-xs text-rose-600 font-medium">{ngo.error}</p>
                )}

                <Button
                  onClick={() => void ngo.handleLogin()}
                  disabled={ngo.isLoading}
                  className="w-full rounded-lg bg-teal-600 hover:bg-teal-700 font-semibold text-sm py-2.5"
                >
                  {ngo.isLoading ? t('auth.loading') : t('auth.ngo.loginBtn')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}