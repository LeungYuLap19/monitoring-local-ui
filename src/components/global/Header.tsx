import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, CreditCard, LogOut, Menu, User } from 'lucide-react';
import { HeaderProps } from '../../types';
import { useTranslation } from '../../lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '../ui/popover';
import { Separator } from '../ui/separator';

export default function Header({
  userEmail,
  adminName = 'admin user',
  role = 'user',
  onMenuClick,
  onLogout,
}: HeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'MOMO剛剛完成了15分鐘放風！', read: false, time: '剛才' },
    { id: 2, text: '注意：MOMO感冒餵藥時間到了（18:00）', read: false, time: '1小時前' },
    { id: 3, text: '系統檢測：特大籠房間3號攝像頭已重新上線', read: true, time: '3小時前' },
  ]);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleLogoutClick = () => {
    setOpenUserMenu(false);
    onLogout?.();
  };

  return (
    <header id="app-header" className="bg-white border-b border-slate-100 py-4 px-4 sm:px-8 flex justify-between items-center sticky top-0 z-40 select-none">
      <div id="header-brand-info" className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden -ml-2 text-slate-500 hover:text-slate-700"
          aria-label="Open sidebar menu"
        >
          <Menu className="size-5" />
        </Button>
        <div className="max-sm:hidden">
          <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            {role === 'user' ? t('header.orgNameUser') : t('header.orgName')}
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5 hidden md:block">
            {t('header.subtitle')}
          </p>
        </div>
      </div>

      <div id="header-actions" className="flex items-center gap-4">
        <Popover open={openNotifications} onOpenChange={setOpenNotifications}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <Badge className="absolute top-1.5 right-1.5 size-4 p-0 bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center animate-bounce rounded-full border-0">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 rounded-2xl border-slate-100 shadow-xl">
            <div className="p-4 border-b border-slate-50 flex justify-between items-center">
              <span className="font-bold text-sm text-slate-700">{t('header.notifications')}</span>
              {unreadCount > 0 && (
                <Button variant="link" onClick={markAllAsRead} className="text-xs text-teal-600 font-semibold h-auto p-0">
                  {t('header.markAllRead')}
                </Button>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`p-4 text-xs transition-colors hover:bg-slate-50 flex flex-col gap-1 ${!n.read ? 'bg-teal-50/20' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`font-semibold ${!n.read ? 'text-teal-600' : 'text-slate-600'}`}>
                      {n.text}
                    </span>
                    {!n.read && <span className="size-1.5 rounded-full bg-teal-500 shrink-0 mt-1" />}
                  </div>
                  <span className="text-[10px] text-slate-300 font-medium">{n.time}</span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <LanguageSwitcher />

        <Popover open={openUserMenu} onOpenChange={setOpenUserMenu}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              id="admin-user-badge"
              className="h-auto flex items-center gap-2 px-3 py-2 bg-teal-600/10 hover:bg-teal-600/15 border border-teal-600/10 text-teal-600 rounded-xl transition-all"
            >
              <div className="size-5 rounded-full bg-teal-600/20 flex items-center justify-center shrink-0">
                <User className="size-3.5" />
              </div>
              <div className="min-w-0 flex flex-col items-start">
                <span className="text-xs font-bold leading-none truncate max-w-[11rem]">{adminName}</span>
              </div>
              <ChevronDown className={`size-4 shrink-0 transition-transform ${openUserMenu ? 'rotate-180' : ''}`} />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 p-0 rounded-2xl border-slate-100 shadow-xl">
            <PopoverHeader className="p-4">
              <PopoverTitle className="text-sm font-bold text-slate-800 break-words">{adminName}</PopoverTitle>
              {userEmail ? (
                <PopoverDescription className="text-xs text-slate-500 break-all">
                  {userEmail}
                </PopoverDescription>
              ) : null}
            </PopoverHeader>
            <Separator className="bg-slate-100" />
            <div className="p-2">
              {role === 'user' && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setOpenUserMenu(false); navigate('/subscription'); }}
                  className="w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                >
                  <CreditCard className="size-4 shrink-0" />
                  <span>{t('nav.subscription')}</span>
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                onClick={handleLogoutClick}
                className="w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-500 hover:bg-rose-50 hover:text-rose-600"
              >
                <LogOut className="size-4 shrink-0" />
                <span>{t('nav.logout')}</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
