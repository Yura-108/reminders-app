import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';

import { OptionGroup } from '@/components/ui/option-group';
import { Spacing } from '@/constants/theme';
import { useSettings } from '@/features/settings/store';
import type {
  LanguagePreference,
  ThemePreference,
  WeekStartPreference,
} from '@/features/settings/types';

const THEMES: ThemePreference[] = ['system', 'light', 'dark'];
const LANGUAGES: LanguagePreference[] = ['system', 'ru', 'en'];
const WEEK_STARTS: WeekStartPreference[] = ['system', 'monday', 'sunday'];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const theme = useSettings((s) => s.theme);
  const language = useSettings((s) => s.language);
  const setTheme = useSettings((s) => s.setTheme);
  const setLanguage = useSettings((s) => s.setLanguage);
  const weekStart = useSettings((s) => s.weekStart);
  const setWeekStart = useSettings((s) => s.setWeekStart);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <OptionGroup
        title={t('settings.theme')}
        value={theme}
        onChange={setTheme}
        options={THEMES.map((value) => ({ value, label: t(`settings.themes.${value}`) }))}
      />
      <OptionGroup
        title={t('settings.language')}
        value={language}
        onChange={setLanguage}
        options={LANGUAGES.map((value) => ({ value, label: t(`settings.languages.${value}`) }))}
      />
      <OptionGroup
        title={t('settings.weekStart')}
        value={weekStart}
        onChange={setWeekStart}
        options={WEEK_STARTS.map((value) => ({ value, label: t(`settings.weekStarts.${value}`) }))}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.three,
    gap: Spacing.four,
  },
});
