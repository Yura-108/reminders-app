import { useTasks } from '@/features/tasks/store';

import { taskIdFromNotificationId } from './constants';
import { Notifications } from './module';
import { expectedNotificationIds } from './schedule';

/**
 * Сверка запланированных уведомлений с задачами (SPEC 4.2), вызывается при запуске:
 * - отменяет «сиротские» уведомления (задача удалена или выполнена);
 * - перепланирует задачи, у которых не хватает ещё не сработавших уведомлений
 *   (например, после переустановки или если система их сбросила).
 * Уже показанные уведомления в шторке не трогает.
 */
export async function reconcileNotifications() {
  const api = Notifications;
  if (!api) {
    return;
  }

  const scheduled = await api.getAllScheduledNotificationsAsync();
  const scheduledIds = new Set(scheduled.map((request) => request.identifier));
  const { tasks, syncNotifications } = useTasks.getState();
  const activeIds = new Set(tasks.filter((task) => !task.completedAt).map((task) => task.id));

  await Promise.all(
    scheduled
      .filter((request) => {
        const taskId = taskIdFromNotificationId(request.identifier);
        return taskId !== null && !activeIds.has(taskId);
      })
      .map((request) => api.cancelScheduledNotificationAsync(request.identifier)),
  );

  for (const task of tasks) {
    const missing = expectedNotificationIds(task).some((id) => !scheduledIds.has(id));
    if (missing) {
      await syncNotifications(task.id);
    }
  }
}
