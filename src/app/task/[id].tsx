import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/empty-state';
import { TaskForm } from '@/components/task-form';
import { useTasks } from '@/features/tasks/store';

export default function EditTaskScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const task = useTasks((s) => s.tasks.find((item) => item.id === id));
  // Запоминаем задачу: после удаления из стора форма ещё доживает до закрытия модалки.
  const [snapshot] = useState(task);
  const current = task ?? snapshot;

  if (!current) {
    return (
      <EmptyState
        icon={{ ios: 'questionmark.circle', android: 'help', web: 'help' }}
        title={t('task.notFound')}
        hint={t('task.notFoundHint')}
      />
    );
  }

  return <TaskForm task={current} initialRemindAt={new Date(current.remindAt)} />;
}
