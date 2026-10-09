/**
 * Цвета приложения для светлой и тёмной темы.
 * Компоненты берут их через `useTheme()`, а не хардкодят.
 */

import '@/global.css';

import { DarkTheme, DefaultTheme, type Theme } from 'expo-router';
import { Platform } from 'react-native';

export const Colors = {
  light: {
    /** Основной текст */
    text: '#11181C',
    /** Подписи, второстепенный текст, неактивные иконки */
    textSecondary: '#60646C',
    /** Фон экрана */
    background: '#F5F6F8',
    /** Фон карточек, шапок и таббара */
    card: '#FFFFFF',
    /** Фон полей ввода, чипов, вложенных блоков */
    backgroundElement: '#ECEDF0',
    /** Нажатый / выбранный элемент */
    backgroundSelected: '#DFE1E6',
    /** Разделители и обводки */
    border: '#E2E4E8',
    /** Акцент: кнопка «+», выбранные элементы, ссылки */
    primary: '#208AEF',
    /** Текст и иконки поверх primary */
    onPrimary: '#FFFFFF',
    /** «Горящие» задачи, удаление */
    danger: '#E5484D',
    /** Выполнено */
    success: '#30A46C',
    /** Дни рождения: кнопка «+» на их вкладке, сегодняшние ДР, точки в календаре */
    birthday: '#E5487F',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: '#0B0B0D',
    card: '#18191B',
    backgroundElement: '#232427',
    backgroundSelected: '#2E3135',
    border: '#2B2D31',
    primary: '#3D9BF5',
    onPrimary: '#FFFFFF',
    danger: '#FF6369',
    success: '#3DD68C',
    birthday: '#FF6B9A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * Тема для навигации (шапки экранов, таббар, фон стека) на основе наших цветов.
 */
export function getNavigationTheme(scheme: 'light' | 'dark'): Theme {
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const colors = Colors[scheme];

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.danger,
    },
  };
}

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
