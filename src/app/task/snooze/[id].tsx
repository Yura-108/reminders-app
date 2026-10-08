import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useWeekStart } from '@/features/settings/use-week-start';
import { useSnackbar } from '@/features/snackbar/store';
import { useTasks } from '@/features/tasks/store';
import { useDateFormat } from '@/hooks/use-date-format';
import { useTheme } from '@/hooks/use-theme';
import { Duration, startOfDay, startOfMinute, withDatePart, withTimePart } from '@/utils/date';
import { pickDate, pickTime } from '@/utils/pickers';

const PRESETS = [
  { key: 'in15', minutes: 15 },
  { key: 'in30', minutes: 30 },
  { key: 'in60', minutes: 60 },
] as const;

/** Момент через `minutes` минут от текущего, без секунд. */
function minutesFromNow(minutes: number) {
  return startOfMinute(new Date(Date.now() + minutes * Duration.MINUTE));
}

/**
 * Меню «Перенести» (SPEC 4.5): нижний лист с вариантами 15 мин / 30 мин / 1 час / своё время.
 * Отсчёт — от момента нажатия. Открывается из уведомления и из окна горящей задачи.
 */
export default function SnoozeScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const task = useTasks((s) => s.tasks.find((item) => item.id === id));
  const snoozeTask = useTasks((s) => s.snoozeTask);
  const showSnackbar = useSnackbar((s) => s.show);
  const { formatWhen, uses24hourClock } = useDateFormat();
  const weekStart = useWeekStart();

  const snooze = (until: Date) => {
    if (!task) return;
    snoozeTask(task.id, until);
    router.back();
    showSnackbar({ message: t('snooze.done', { time: formatWhen(until, new Date()) }) });
  };

  const handlePreset = (minutes: number) => {
    snooze(minutesFromNow(minutes));
  };

  const handleCustom = async () => {
    const now = new Date();
    const initial = minutesFromNow(60);

    const date = await pickDate({
      value: initial,
      minimumDate: startOfDay(now),
      firstDayOfWeek: weekStart,
    });
    if (!date) return;
    const time = await pickTime({ value: withDatePart(initial, date), is24Hour: uses24hourClock });
    if (!time) return;

    const until = withTimePart(withDatePart(initial, date), time);
    if (until.getTime() <= new Date().getTime()) {
      Alert.alert(t('task.pastError'));
      return;
    }
    snooze(until);
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + Spacing.three }]}>
      <ThemedText type="smallBold" style={styles.title} numberOfLines={2}>
        {t('snooze.title', { title: task?.title ?? '' })}
      </ThemedText>

      <View style={styles.grid}>
        {PRESETS.map((preset) => (
          <SnoozeButton
            key={preset.key}
            label={t(`snooze.${preset.key}`)}
            onPress={() => handlePreset(preset.minutes)}
          />
        ))}
        <SnoozeButton label={t('snooze.custom')} onPress={handleCustom} />
      </View>

      <Pressable onPress={() => router.back()} style={styles.cancel} accessibilityRole="button">
        <ThemedText style={{ color: theme.textSecondary }}>{t('common.cancel')}</ThemedText>
      </Pressable>
    </View>
  );
}

function SnoozeButton({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
      ]}>
      <ThemedText>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.four,
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  button: {
    // Два столбца: половина ширины минус половина отступа между ними.
    flexBasis: '48%',
    flexGrow: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  cancel: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
});
