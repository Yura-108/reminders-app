import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, ScrollView, StyleSheet, Switch, Vibration } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { OptionGroup } from '@/components/ui/option-group';
import { SettingsGroup, SettingsRow } from '@/components/ui/settings-group';
import { Spacing } from '@/constants/theme';
import { VIBRATION_PATTERNS } from '@/features/notifications/constants';
import { useNotificationPermission } from '@/features/notifications/permissions';
import { useSettings } from '@/features/settings/store';
import type {
  LanguagePreference,
  ThemePreference,
  VibrationPreset,
  WeekStartPreference,
} from '@/features/settings/types';
import { useTheme } from '@/hooks/use-theme';

const THEMES: ThemePreference[] = ['system', 'light', 'dark'];
const LANGUAGES: LanguagePreference[] = ['system', 'ru', 'en'];
const WEEK_STARTS: WeekStartPreference[] = ['system', 'monday', 'sunday'];
const VIBRATIONS: VibrationPreset[] = ['none', 'short', 'long', 'pulse'];

/** Проиграть паттерн вибрации — тот же, что у канала уведомлений. */
function previewVibration(preset: VibrationPreset) {
  const pattern = VIBRATION_PATTERNS[preset];
  if (pattern) {
    Vibration.vibrate(pattern);
  }
}

/** Настройки (SPEC 3.5). Изменения применяются сразу, без кнопки «Сохранить». */
export default function SettingsScreen() {
  const { t } = useTranslation();
  const colors = useTheme();
  const settings = useSettings();
  const permission = useNotificationPermission((s) => s.status);
  const ensurePermission = useNotificationPermission((s) => s.ensure);

  const handleVibration = (preset: VibrationPreset) => {
    settings.setVibration(preset);
    previewVibration(preset);
  };

  const permissionAction =
    permission === 'denied'
      ? { label: t('settings.permissionOpenSettings'), onPress: () => Linking.openSettings() }
      : permission === 'undetermined'
        ? { label: t('settings.permissionAllow'), onPress: () => ensurePermission() }
        : null;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <OptionGroup
        title={t('settings.theme')}
        value={settings.theme}
        onChange={settings.setTheme}
        options={THEMES.map((value) => ({ value, label: t(`settings.themes.${value}`) }))}
      />
      <OptionGroup
        title={t('settings.language')}
        value={settings.language}
        onChange={settings.setLanguage}
        options={LANGUAGES.map((value) => ({ value, label: t(`settings.languages.${value}`) }))}
      />
      <OptionGroup
        title={t('settings.weekStart')}
        value={settings.weekStart}
        onChange={settings.setWeekStart}
        options={WEEK_STARTS.map((value) => ({ value, label: t(`settings.weekStarts.${value}`) }))}
      />

      <SettingsGroup title={t('settings.notifications')} footer={t('settings.escalationHint')}>
        <SettingsRow
          label={t('settings.permission')}
          description={t(`settings.permissionStatus.${permission}`)}
          right={
            permissionAction ? (
              <Pressable onPress={permissionAction.onPress} hitSlop={8} accessibilityRole="button">
                <ThemedText type="smallBold" style={{ color: colors.primary }}>
                  {permissionAction.label}
                </ThemedText>
              </Pressable>
            ) : null
          }
        />
        <SettingsRow
          label={t('settings.escalation')}
          onPress={() => settings.setEscalation(!settings.escalation)}
          accessibilityRole="switch"
          accessibilityState={{ checked: settings.escalation }}
          right={
            <Switch
              value={settings.escalation}
              onValueChange={settings.setEscalation}
              trackColor={{ true: colors.primary, false: colors.backgroundSelected }}
              thumbColor={colors.onPrimary}
            />
          }
        />
      </SettingsGroup>

      <OptionGroup
        title={t('settings.vibration')}
        value={settings.vibration}
        onChange={handleVibration}
        options={VIBRATIONS.map((value) => ({ value, label: t(`settings.vibrations.${value}`) }))}
        footer={t('settings.vibrationHint')}>
        <SettingsRow
          label={t('settings.tryVibration')}
          onPress={() => previewVibration(settings.vibration)}
        />
      </OptionGroup>

      <SettingsGroup title={t('settings.about')}>
        <SettingsRow
          label={t('settings.version')}
          right={
            <ThemedText themeColor="textSecondary">{Constants.expoConfig?.version ?? '—'}</ThemedText>
          }
        />
      </SettingsGroup>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
});
