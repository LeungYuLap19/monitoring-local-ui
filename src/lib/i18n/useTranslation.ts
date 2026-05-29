import { useContext, useCallback } from 'react';
import { I18nContext } from './I18nProvider';
import { TranslationParams } from './types';
import zhTW from '../locales/zh-TW.json';
import en from '../locales/en.json';

const locales = { 'zh-TW': zhTW, en } as const;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') return path;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'string' ? current : path;
}

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(params[key] ?? `{{${key}}}`));
}

export function useTranslation() {
  const { locale, setLocale } = useContext(I18nContext);
  const translations = locales[locale];

  const t = useCallback((key: string, params?: TranslationParams): string => {
    const value = getNestedValue(translations as unknown as Record<string, unknown>, key);
    return interpolate(value, params);
  }, [translations]);

  return { t, locale, setLocale };
}
