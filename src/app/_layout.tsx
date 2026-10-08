import '@/i18n';

import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

import { getNavigationTheme } from '@/constants/theme';
import { applyInitialTheme, useApplySettings } from '@/features/settings/use-apply-settings';
import { useResolvedColorScheme } from '@/hooks/use-theme';

applyInitialTheme();

export default function RootLayout() {
  useApplySettings();
  const { t } = useTranslation();
  const scheme = useResolvedColorScheme();

  return (
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
    </ThemeProvider>
  );
}
