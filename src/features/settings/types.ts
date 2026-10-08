export type ThemePreference = 'system' | 'light' | 'dark';

export type LanguagePreference = 'system' | 'ru' | 'en';

export type VibrationPreset = 'none' | 'short' | 'long' | 'pulse';

export type Settings = {
  theme: ThemePreference;
  language: LanguagePreference;
  /** Вибрация уведомлений (SPEC 4.3) */
  vibration: VibrationPreset;
  /** Повторять уведомление, пока задача не выполнена (SPEC 4.1) */
  escalation: boolean;
};
