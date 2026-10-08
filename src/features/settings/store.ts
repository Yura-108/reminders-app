import Storage from 'expo-sqlite/kv-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { LanguagePreference, Settings, ThemePreference } from './types';

type SettingsState = Settings & {
  setTheme: (theme: ThemePreference) => void;
  setLanguage: (language: LanguagePreference) => void;
};

const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  language: 'system',
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
      partialize: ({ theme, language }) => ({ theme, language }),
    },
  ),
);
