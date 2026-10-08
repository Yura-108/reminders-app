/**
 * Цвета текущей темы. Подробнее: https://docs.expo.dev/develop/user-interface/color-themes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** Текущая схема: 'light' | 'dark' (вместо 'unspecified' — светлая). */
export function useResolvedColorScheme() {
  const scheme = useColorScheme();

  return scheme === 'dark' ? 'dark' : 'light';
}

export function useTheme() {
  return Colors[useResolvedColorScheme()];
}
