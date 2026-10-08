import { router } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutAnimation, Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { TaskSectionList } from '@/components/task-section-list';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { makeSampleTask } from '@/features/tasks/dev-samples';
import { useTasks } from '@/features/tasks/store';
import type { Task } from '@/features/tasks/types';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';

export default function TasksScreen() {
  const { t } = useTranslation();
  const now = useNow();
  const tasks = useTasks((s) => s.tasks);
  const ready = useTasks((s) => s.ready);
  const toggleDone = useTasks((s) => s.toggleDone);

  const openTask = useCallback((task: Task) => {
    router.push({ pathname: '/task/[id]', params: { id: task.id } });
  }, []);

  const handleToggleDone = useCallback(
    (task: Task) => {
      // Следующее изменение раскладки (карточка уезжает в другую секцию) будет плавным.
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      toggleDone(task.id);
    },
    [toggleDone],
  );

  if (!ready) {
    return null;
  }

  const devButton = __DEV__ ? <DevAddButton /> : null;

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={{ ios: 'checklist', android: 'checklist', web: 'checklist' }}
        title={t('tasks.emptyTitle')}
        hint={t('tasks.emptyHint')}>
        {devButton}
      </EmptyState>
    );
  }

  return (
    <TaskSectionList
      tasks={tasks}
      now={now}
      onPressTask={openTask}
      onToggleDone={handleToggleDone}
      ListFooterComponent={devButton}
    />
  );
}

/** Временная кнопка для разработки: наполняет список тестовыми задачами. */
function DevAddButton() {
  const { t } = useTranslation();
  const theme = useTheme();
  const addTask = useTasks((s) => s.addTask);

  return (
    <View style={styles.devButtonWrap}>
      <Pressable
        onPress={() => addTask(makeSampleTask())}
        style={({ pressed }) => [
          styles.devButton,
          { borderColor: theme.primary, opacity: pressed ? 0.6 : 1 },
        ]}>
        <ThemedText type="small" style={{ color: theme.primary }}>
          {t('tasks.devAdd')}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  devButtonWrap: {
    alignItems: 'center',
    paddingTop: Spacing.four,
  },
  devButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
});
