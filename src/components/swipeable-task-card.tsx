import { memo } from 'react';

import { SwipeableRow } from '@/components/swipeable-row';
import { TaskCard } from '@/components/task-card';
import type { Task, TaskStatus } from '@/features/tasks/types';
import { useDelayedDone } from '@/features/tasks/use-delayed-done';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  task: Task;
  status: TaskStatus;
  whenLabel: string;
  onPress: (task: Task) => void;
  onToggleDone: (task: Task) => void;
  onDelete: (task: Task) => void;
};

/**
 * Карточка задачи со свайпами (SPEC 3.1):
 * - вправо — выполнено (та же анимация, что у чекбокса) / вернуть в работу;
 * - влево — удалить: карточка остаётся сдвинутой на красном фоне и «схлопывается» по высоте.
 */
export const SwipeableTaskCard = memo(function SwipeableTaskCard({
  task,
  status,
  whenLabel,
  onPress,
  onToggleDone,
  onDelete,
}: Props) {
  const theme = useTheme();
  const { pendingDone, toggle } = useDelayedDone(task, status, onToggleDone);
  const done = status === 'done';

  return (
    <SwipeableRow
      onDelete={() => onDelete(task)}
      swipeRight={{
        color: done ? theme.primary : theme.success,
        icon: done
          ? { ios: 'arrow.uturn.backward', android: 'undo', web: 'undo' }
          : { ios: 'checkmark', android: 'check', web: 'check' },
        // Карточка возвращается на место и ставится галочка — как при тапе по чекбоксу.
        onTrigger: toggle,
      }}>
      <TaskCard
        task={task}
        status={status}
        whenLabel={whenLabel}
        pendingDone={pendingDone}
        onPress={onPress}
        onCheckboxPress={toggle}
      />
    </SwipeableRow>
  );
});
