import Storage from 'expo-sqlite/kv-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  LanguagePreference,
  Settings,
  ThemePreference,
  VibrationPreset,
  WeekStartPreference,
} from './types';

type SettingsState = Settings & {
  setTheme: (theme: ThemePreference) => void;
  setLanguage: (language: LanguagePreference) => void;
  setWeekStart: (weekStart: WeekStartPreference) => void;
  setVibration: (vibration: VibrationPreset) => void;
  setEscalation: (escalation: boolean) => void;
};

const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  language: 'system',
  weekStart: 'system',
  vibration: 'short',
  escalation: true,
};

/**
 * Настройки приложения. Сохраняются в SQLite kv-store синхронно,
 * поэтому уже при первом рендере стор содержит сохранённые значения (без «мигания» темы/языка).
 */
export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setWeekStart: (weekStart) => set({ weekStart }),
      setVibration: (vibration) => set({ vibration }),
      setEscalation: (escalation) => set({ escalation }),
    }),
    {
      name: 'settings',
      version: 1,
      storage: createJSONStorage(() => ({
        getItem: (key) => Storage.getItemSync(key),
        setItem: (key, value) => Storage.setItemSync(key, value),
        removeItem: (key) => {
          Storage.removeItemSync(key);
        },
      })),
      // Сохранённые ранее настройки сливаются с DEFAULT_SETTINGS, поэтому новые поля получают значения по умолчанию.
      partialize: ({ theme, language, weekStart, vibration, escalation }) => ({
        theme,
        language,
        weekStart,
        vibration,
        escalation,
      }),
    },
  ),
);
