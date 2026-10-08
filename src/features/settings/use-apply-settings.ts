import { useLocales } from 'expo-localization';
import { useEffect } from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';

import i18n, { resolveLanguage } from '@/i18n';

import { useSettings } from './store';
import type { ThemePreference } from './types';

function toColorScheme(theme: ThemePreference): ColorSchemeName {
  // 'unspecified' — вернуть управление системе.
  return theme === 'system' ? 'unspecified' : theme;
}

/** Применить тему сразу при запуске, до первого рендера. */
export function applyInitialTheme() {
  Appearance.setColorScheme(toColorScheme(useSettings.getState().theme));
}

/**
 * Следит за настройками и применяет их: тема — через Appearance (тогда `useColorScheme()`
 * во всём приложении возвращает выбранную), язык — через i18next.
 * «Системный» язык пересчитывается, если пользователь сменил язык телефона.
 */
export function useApplySettings() {
  const theme = useSettings((s) => s.theme);
  const languagePreference = useSettings((s) => s.language);
  const systemLanguageCode = useLocales()[0]?.languageCode;
  const language = resolveLanguage(languagePreference, systemLanguageCode);

  useEffect(() => {
    Appearance.setColorScheme(toColorScheme(theme));
  }, [theme]);

  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);
}
