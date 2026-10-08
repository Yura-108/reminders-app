import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Calendar, type CalendarProps, type DateData } from 'react-native-calendars';

import { Snackbar } from '@/components/snackbar';
import { SwipeableTaskCard } from '@/components/swipeable-task-card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import '@/features/calendar/locale';
import { useCalendarSelection } from '@/features/calendar/store';
import { useWeekStart } from '@/features/settings/use-week-start';
import { buildDayMarkers, getTaskStatus, tasksForDay } from '@/features/tasks/selectors';
import { useTasks } from '@/features/tasks/store';
import type { Task } from '@/features/tasks/types';
import { useTaskActions } from '@/features/tasks/use-task-actions';
import { useDateFormat } from '@/hooks/use-date-format';
import { useNow } from '@/hooks/use-now';
import { useResolvedColorScheme, useTheme } from '@/hooks/use-theme';
import { parseDayParam, toDayKey } from '@/utils/date';

/**
 * Календарь (SPEC 3.3): месячная сетка с точками на днях с задачами и список задач выбранного дня.
 * Выбранный день хранится в общем сторе — его использует кнопка «+» для даты новой задачи.
 */
export default function CalendarScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const scheme = useResolvedColorScheme();
  const now = useNow();
  const tasks = useTasks((s) => s.tasks);
  const selectedDay = useCalendarSelection((s) => s.selectedDay);
  const selectDay = useCalendarSelection((s) => s.selectDay);
  const { openTask, handleToggleDone, handleDelete } = useTaskActions();
  const { formatTime, formatDayTitle } = useDateFormat();
  const weekStart = useWeekStart();

  const todayKey = toDayKey(now);
  const [visibleMonth, setVisibleMonth] = useState(selectedDay.slice(0, 7));
  // Смена ключа пересоздаёт календарь — так кнопка «Сегодня» возвращает и к текущему месяцу.
  const [resetCount, setResetCount] = useState(0);

  const markedDates = useMemo(() => {
    const dotColors = { burning: theme.danger, active: theme.primary, done: theme.textSecondary };
    const result: NonNullable<CalendarProps['markedDates']> = {};

    for (const [day, marker] of buildDayMarkers(tasks, now)) {
      result[day] = { marked: true, dotColor: dotColors[marker] };
    }
    result[selectedDay] = {
      ...result[selectedDay],
      selected: true,
      selectedColor: theme.primary,
    };

    return result;
  }, [tasks, now, selectedDay, theme]);

  const calendarTheme = useMemo(
    () => ({
      calendarBackground: theme.card,
      dayTextColor: theme.text,
      textDisabledColor: theme.textSecondary,
      textSectionTitleColor: theme.textSecondary,
      monthTextColor: theme.text,
      todayTextColor: theme.primary,
      selectedDayBackgroundColor: theme.primary,
      selectedDayTextColor: theme.onPrimary,
      selectedDotColor: theme.onPrimary,
      arrowColor: theme.primary,
      textMonthFontWeight: '600' as const,
    }),
    [theme],
  );

  const dayTasks = useMemo(() => tasksForDay(tasks, selectedDay), [tasks, selectedDay]);
  const selectedDate = parseDayParam(selectedDay) ?? now;
  const showTodayButton = selectedDay !== todayKey || visibleMonth !== todayKey.slice(0, 7);

  const goToToday = () => {
    selectDay(todayKey);
    setVisibleMonth(todayKey.slice(0, 7));
    setResetCount((count) => count + 1);
  };

  const renderItem = useCallback(
    ({ item }: { item: Task }) => (
      <SwipeableTaskCard
        task={item}
        status={getTaskStatus(item, now)}
        whenLabel={formatTime(new Date(item.remindAt))}
        onPress={openTask}
        onToggleDone={handleToggleDone}
        onDelete={handleDelete}
      />
    ),
    [now, formatTime, openTask, handleToggleDone, handleDelete],
  );

  const header = (
    <>
      <View style={[styles.calendarCard, { backgroundColor: theme.card }]}>
        <Calendar
          // Пересоздаём при смене темы и языка: календарь кэширует стили и названия месяцев.
          key={`${scheme}-${i18n.language}-${weekStart}-${resetCount}`}
          current={selectedDay}
          firstDay={weekStart}
          markedDates={markedDates}
          onDayPress={(day: DateData) => selectDay(day.dateString)}
          onMonthChange={(month: DateData) => setVisibleMonth(month.dateString.slice(0, 7))}
          enableSwipeMonths
          theme={calendarTheme}
        />
      </View>

      <View style={styles.dayHeader}>
        <ThemedText type="smallBold" style={styles.dayTitle}>
          {formatDayTitle(selectedDate)}
        </ThemedText>
        {showTodayButton ? (
          <Pressable onPress={goToToday} hitSlop={8} accessibilityRole="button">
            <ThemedText type="smallBold" style={{ color: theme.primary }}>
              {t('calendar.today')}
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
    </>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={dayTasks}
        keyExtractor={(task) => task.id}
        renderItem={renderItem}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ThemedText themeColor="textSecondary">{t('calendar.emptyDay')}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {t('calendar.emptyDayHint')}
            </ThemedText>
          </View>
        }
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.content}
      />
      <Snackbar />
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
  },
  calendarCard: {
    borderRadius: 14,
    overflow: 'hidden',
    paddingBottom: Spacing.two,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.one,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
  },
  dayTitle: {
    fontSize: 16,
  },
  empty: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.five,
  },
  separator: {
    height: Spacing.two,
  },
});
