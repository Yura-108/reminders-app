import { SymbolView } from 'expo-symbols';
import { useCallback, useDeferredValue, useMemo, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';

import { SwipeableTaskCard } from '@/components/swipeable-task-card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { buildTaskSections, getTaskStatus, type TaskSection } from '@/features/tasks/selectors';
import type { Task } from '@/features/tasks/types';
import { useDateFormat } from '@/hooks/use-date-format';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  tasks: Task[];
  now: Date;
  onPressTask: (task: Task) => void;
  onToggleDone: (task: Task) => void;
  onDelete: (task: Task) => void;
  ListFooterComponent?: ReactElement | null;
};

/**
 * Список задач по секциям: Горящие, Сегодня, Завтра, Позже, Выполненные (свёрнута по умолчанию).
 * SectionList, в отличие от `.map()`, рендерит только видимые элементы — как виртуализация в вебе.
 */
export function TaskSectionList({
  tasks,
  now,
  onPressTask,
  onToggleDone,
  onDelete,
  ListFooterComponent,
}: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { formatWhen } = useDateFormat();
  const [doneExpanded, setDoneExpanded] = useState(false);
  // Стрелка в заголовке поворачивается сразу, а тяжёлый рендер карточек идёт следом
  // в фоне и не блокирует интерфейс (React может прервать его ради более срочных обновлений).
  const deferredDoneExpanded = useDeferredValue(doneExpanded);

  const sections = useMemo(() => buildTaskSections(tasks, now), [tasks, now]);

  // Для свёрнутой секции оставляем заголовок, но убираем элементы.
  const visibleSections = useMemo(
    () =>
      sections.map((section) => ({
        ...section,
        total: section.data.length,
        data: section.key === 'done' && !deferredDoneExpanded ? [] : section.data,
      })),
    [sections, deferredDoneExpanded],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: TaskSection & { total: number } }) => {
      const isDone = section.key === 'done';
      const color = section.key === 'burning' ? theme.danger : theme.textSecondary;
      const label = `${t(`tasks.sections.${section.key}`)} (${section.total})`;

      if (!isDone) {
        return (
          <ThemedText type="smallBold" style={[styles.sectionTitle, { color }]}>
            {label}
          </ThemedText>
        );
      }

      return (
        <Pressable
          onPress={() => setDoneExpanded((value) => !value)}
          accessibilityRole="button"
          accessibilityState={{ expanded: doneExpanded }}
          style={styles.sectionToggle}>
          <SymbolView
            name={
              doneExpanded
                ? { ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }
                : { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }
            }
            tintColor={color}
            size={18}
          />
          <ThemedText type="smallBold" style={[styles.sectionTitle, styles.toggleTitle, { color }]}>
            {label}
          </ThemedText>
        </Pressable>
      );
    },
    [doneExpanded, t, theme],
  );

  const renderItem = useCallback(
    ({ item }: { item: Task }) => (
      <SwipeableTaskCard
        task={item}
        status={getTaskStatus(item, now)}
        whenLabel={formatWhen(new Date(item.remindAt), now)}
        onPress={onPressTask}
        onToggleDone={onToggleDone}
        onDelete={onDelete}
      />
    ),
    [now, formatWhen, onPressTask, onToggleDone, onDelete],
  );

  return (
    <SectionList
      sections={visibleSections}
      keyExtractor={(task) => task.id}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      ItemSeparatorComponent={Separator}
      stickySectionHeadersEnabled={false}
      // Виртуализация: сколько карточек рендерить сразу и сколько экранов держать вокруг видимой области.
      initialNumToRender={12}
      maxToRenderPerBatch={8}
      windowSize={7}
      contentContainerStyle={styles.content}
      ListFooterComponent={ListFooterComponent}
    />
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.one,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  sectionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  toggleTitle: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  separator: {
    height: Spacing.two,
  },
});
