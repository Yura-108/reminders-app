export type ThemePreference = 'system' | 'light' | 'dark';

export type LanguagePreference = 'system' | 'ru' | 'en';

export type VibrationPreset = 'none' | 'short' | 'long' | 'pulse';

/** Первый день недели в календаре и выборе даты. 'system' — по региональным настройкам телефона. */
export type WeekStartPreference = 'system' | 'monday' | 'sunday';

export type Settings = {
  theme: ThemePreference;
  language: LanguagePreference;
  weekStart: WeekStartPreference;
  /** Вибрация уведомлений (SPEC 4.3) */
  vibration: VibrationPreset;
  /** Повторять уведомление, пока задача не выполнена (SPEC 4.1) */
  escalation: boolean;
};
