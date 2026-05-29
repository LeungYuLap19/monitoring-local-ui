import { useTranslation, Locale } from '../../lib/i18n';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  return (
    <select
      id="lang-switcher"
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 hover:bg-slate-100 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500/20"
    >
      <option value="zh-TW">繁中</option>
      <option value="en">EN</option>
    </select>
  );
}
