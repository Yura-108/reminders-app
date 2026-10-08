export type ThemePreference = 'system' | 'light' | 'dark';

export type LanguagePreference = 'system' | 'ru' | 'en';

export type Settings = {
  theme: ThemePreference;
  language: LanguagePreference;
};
