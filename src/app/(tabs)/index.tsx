import { router } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutAnimation, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { PermissionBanner } from '@/components/permission-banner';
import { Snackbar } from '@/components/snackbar';
import { TaskSectionList } from '@/components/task-section-list';
import { useSnackbar } from '@/features/snackbar/store';
import { useTasks } from '@/features/tasks/store';
import type { Task } from '@/features/tasks/types';
import { useNow } from '@/hooks/use-now';

export default function TasksScreen() {
  const { t } = useTranslation();
  const now = useNow();
  const tasks = useTasks((s) => s.tasks);
  const ready = useTasks((s) => s.ready);
  const toggleDone = useTasks((s) => s.toggleDone);
  const deleteTask = useTasks((s) => s.deleteTask);
  const restoreTask = useTasks((s) => s.restoreTask);
  const showSnackbar = useSnackbar((s) => s.show);

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

  const handleDelete = useCallback(
    (task: Task) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      deleteTask(task.id);
      showSnackbar({
        message: t('tasks.deleted'),
        actionLabel: t('common.undo'),
        onAction: () => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          restoreTask(task);
        },
      });
    },
    [deleteTask, restoreTask, showSnackbar, t],
  );

  if (!ready) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <PermissionBanner />
      {tasks.length === 0 ? (
        <EmptyState
          icon={{ ios: 'checklist', android: 'checklist', web: 'checklist' }}
          title={t('tasks.emptyTitle')}
          hint={t('tasks.emptyHint')}
        />
      ) : (
        <TaskSectionList
          tasks={tasks}
          now={now}
          onPressTask={openTask}
          onToggleDone={handleToggleDone}
          onDelete={handleDelete}
        />
      )}
      <Snackbar />
    </View>
  );
}
