import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, CreditCard, LogOut, User } from 'lucide-react';
import { TabId, SidebarProps } from '../../types';
import { NAV_ITEMS, LOCAL_TABS, getVercelRedirectUrl } from '../../constants';
import { useTranslation } from '../../lib/i18n';
import { getStoredAccessToken, getStoredAuthUser } from '../../lib/utils/auth';
import HKBRIcon from './HKBRIcon';
import PHealthIcon from './PHealthIcon';
import LanguageSwitcher from './LanguageSwitcher';
import { Button } from '../ui/button';
import { Sheet, SheetContent } from '../ui/sheet';
import xiaomiIcon from '../../assets/icons/xiaomi.svg';

function buildRedirectUrl(url: string): string {
  const token = getStoredAccessToken();
  const user = getStoredAuthUser();
  if (!token) return url;
  const hash = new URLSearchParams();
  hash.set('access_token', token);
  if (user) hash.set('user', JSON.stringify(user));
  return `${url}#${hash.toString()}`;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  role = 'user',
  isOpen,
  onClose,
  adminName,
  userEmail,
  onLogout,
  onMenuClick,
  xiaomiConnected,
  onXiaomiLogout,
}: SidebarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleTabClick = (tab: TabId) => {
    if (!LOCAL_TABS.has(tab)) {
      window.location.href = buildRedirectUrl(getVercelRedirectUrl(tab));
      return;
    }
    setActiveTab(tab);
    if (onClose) onClose();
  };

  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(role),
  );

  const sidebarContent = (
    <>
      <div id="sidebar-upper" className="flex flex-col p-6 space-y-8">
        <div className="flex items-center gap-2.5">
          {role === 'user' ? <PHealthIcon size="small" /> : (
            <>
              <HKBRIcon />
              <span className="text-sm font-bold text-slate-800">{t('header.orgName')}</span>
            </>
          )}
        </div>
        <span className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4 px-2">
          {t('nav.menu')}
        </span>

        <nav id="sidebar-nav" className="flex flex-col gap-1.5">
          {visibleNavItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <Button
                key={id}
                variant="ghost"
                onClick={() => handleTabClick(id)}
                className={`flex items-center justify-between px-4 py-3 h-auto rounded-xl text-sm font-semibold transition-all w-full ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-900/10 hover:bg-[#0c857a] hover:text-white'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="size-4.5 shrink-0" />
                  <span>{t(label)}</span>
                </div>
              </Button>
            );
          })}
        </nav>
      </div>

      <div id="sidebar-footer" className="p-4 space-y-3 border-t border-slate-100">
        <div className="px-2">
          <LanguageSwitcher />
        </div>

        {adminName && (
          <div className="relative">
            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-slate-100 rounded-xl shadow-md p-1.5">
                {role === 'user' && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => { setUserMenuOpen(false); window.location.href = buildRedirectUrl(getVercelRedirectUrl('subscription')); }}
                    className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  >
                    <CreditCard className="size-3.5" />
                    <span>{t('nav.subscription')}</span>
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setUserMenuOpen(false); onLogout?.(); }}
                  className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                >
                  <LogOut className="size-3.5" />
                  <span>{t('nav.logout')}</span>
                </Button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="size-7 rounded-full bg-teal-600/10 flex items-center justify-center shrink-0">
                <User className="size-3.5 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-semibold text-slate-700 truncate">{adminName}</p>
                {userEmail && (
                  <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
                )}
              </div>
              <ChevronDown className={`size-3.5 text-slate-400 shrink-0 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 flex-col justify-between h-screen select-none lg:sticky">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar using Sheet */}
      <Sheet open={isOpen} onOpenChange={(open) => { if (!open && onClose) onClose(); }}>
        <SheetContent side="left" className="w-64 p-0 flex flex-col justify-between">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    </>
  );
}