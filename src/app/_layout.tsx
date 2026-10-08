import '@/i18n';

import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { getNavigationTheme } from '@/constants/theme';
import { applyInitialTheme, useApplySettings } from '@/features/settings/use-apply-settings';
import { useTasks } from '@/features/tasks/store';
import { WeeklyCleanup } from '@/features/tasks/weekly-cleanup';
import { useResolvedColorScheme } from '@/hooks/use-theme';

applyInitialTheme();
// Держим сплэш, пока задачи не загрузятся из БД, чтобы не показывать пустой список.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useApplySettings();
  const { t } = useTranslation();

  useEffect(() => {
    useTasks
      .getState()
      .init()
      .catch((error) => console.error('Failed to load tasks', error))
      .finally(() => SplashScreen.hideAsync());
  }, []);
  const scheme = useResolvedColorScheme();

  return (
    // Корень для жестов (свайпы карточек). Должен оборачивать всё приложение.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={getNavigationTheme(scheme)}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="task/new"
            options={{ presentation: 'modal', title: t('task.newTitle') }}
          />
          <Stack.Screen
            name="task/[id]"
            options={{ presentation: 'modal', title: t('task.editTitle') }}
          />
          <Stack.Screen
            name="task/snooze/[id]"
            options={{
              presentation: 'formSheet',
              sheetAllowedDetents: 'fitToContents',
              headerShown: false,
            }}
          />
        </Stack>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <WeeklyCleanup />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
