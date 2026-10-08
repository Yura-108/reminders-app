import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { PermissionBanner } from '@/components/permission-banner';
import { Snackbar } from '@/components/snackbar';
import { TaskSectionList } from '@/components/task-section-list';
import { useTasks } from '@/features/tasks/store';
import { useTaskActions } from '@/features/tasks/use-task-actions';
import { useNow } from '@/hooks/use-now';

export default function TasksScreen() {
  const { t } = useTranslation();
  const now = useNow();
  const tasks = useTasks((s) => s.tasks);
  const ready = useTasks((s) => s.ready);
  const { openTask, handleToggleDone, handleDelete } = useTaskActions();

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
