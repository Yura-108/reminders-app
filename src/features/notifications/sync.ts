import {
  BIRTHDAY_NOTIFICATION_PREFIX,
  birthdayIdFromNotificationId,
  expectedBirthdayNotificationIds,
} from '@/features/birthdays/notifications';
import { useBirthdays } from '@/features/birthdays/store';
import { useTasks } from '@/features/tasks/store';

import { taskIdFromNotificationId } from './constants';
import { Notifications } from './module';
import { expectedNotificationIds } from './schedule';

/**
 * Сверка запланированных уведомлений с данными (SPEC 4.2, 12.5), вызывается при запуске,
 * когда загружены и задачи, и дни рождения:
 * - отменяет «сиротские» уведомления (задача удалена/выполнена, день рождения удалён);
 * - перепланирует то, у чего не хватает ещё не сработавших уведомлений
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
  const tasks = useTasks.getState();
  const birthdays = useBirthdays.getState();
  const activeTaskIds = new Set(
    tasks.tasks.filter((task) => !task.completedAt).map((task) => task.id),
  );
  const birthdayIds = new Set(birthdays.birthdays.map((birthday) => birthday.id));

  const isOrphan = (identifier: string) => {
    if (identifier.startsWith(BIRTHDAY_NOTIFICATION_PREFIX)) {
      const birthdayId = birthdayIdFromNotificationId(identifier);
      return birthdayId !== null && !birthdayIds.has(birthdayId);
    }
    const taskId = taskIdFromNotificationId(identifier);
    return taskId !== null && !activeTaskIds.has(taskId);
  };

  await Promise.all(
    scheduled
      .filter((request) => isOrphan(request.identifier))
      .map((request) => api.cancelScheduledNotificationAsync(request.identifier)),
  );

  for (const task of tasks.tasks) {
    if (expectedNotificationIds(task).some((id) => !scheduledIds.has(id))) {
      await tasks.syncNotifications(task.id);
    }
  }

  for (const birthday of birthdays.birthdays) {
    if (expectedBirthdayNotificationIds(birthday).some((id) => !scheduledIds.has(id))) {
      await birthdays.syncNotifications(birthday.id);
    }
  }
}
