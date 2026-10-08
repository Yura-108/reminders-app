import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { useSettings } from '@/features/settings/store';
import type { LanguagePreference } from '@/features/settings/types';

import en from './en';
import ru from './ru';

export const SUPPORTED_LANGUAGES = ['ru', 'en'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const FALLBACK_LANGUAGE: AppLanguage = 'en';

function isSupported(code: string | null | undefined): code is AppLanguage {
  return SUPPORTED_LANGUAGES.includes(code as AppLanguage);
}

/**
 * Язык интерфейса по настройке пользователя. «Системный» — первый язык системы,
 * если мы его поддерживаем, иначе английский.
 */
export function resolveLanguage(
  preference: LanguagePreference,
  systemLanguageCode = getLocales()[0]?.languageCode,
): AppLanguage {
  if (preference !== 'system') {
    return preference;
  }

  return isSupported(systemLanguageCode) ? systemLanguageCode : FALLBACK_LANGUAGE;
}

const i18n = createInstance();

// Инициализация синхронная (словари уже в бандле), поэтому первый рендер сразу на нужном языке.
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
  },
  lng: resolveLanguage(useSettings.getState().language),
  fallbackLng: FALLBACK_LANGUAGE,
  initAsync: false,
  interpolation: {
    // React сам экранирует строки.
    escapeValue: false,
  },
});

export default i18n;
