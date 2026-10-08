import { getCalendars } from 'expo-localization';

import { useSettings } from '@/features/settings/store';
import type { Task } from '@/features/tasks/types';
import i18n from '@/i18n';
import { Duration } from '@/utils/date';
import { createDateFormatter } from '@/utils/date-format';

import {
  channelIdFor,
  ESCALATION_OFFSETS_MIN,
  notificationIdFor,
  REMINDER_CATEGORY,
} from './constants';
import { Notifications } from './module';

/**
 * Планирует уведомления задачи (SPEC 4.1): в T и повторы по ESCALATION_OFFSETS_MIN.
 * Прошедшие моменты пропускаются, поэтому у горящей задачи остаются только будущие повторы.
 * Возвращает id запланированных уведомлений.
 */
export async function scheduleTaskNotifications(task: Task): Promise<string[]> {
  const api = Notifications;
  if (!api || task.completedAt) {
    return [];
  }

  const { vibration, escalation } = useSettings.getState();
  const offsets = escalation ? ESCALATION_OFFSETS_MIN : ESCALATION_OFFSETS_MIN.slice(0, 1);
  const remindAt = new Date(task.remindAt);
  const now = Date.now();
  // Текст фиксируется на языке, активном в момент планирования (SPEC 6.2).
  const { formatTime } = createDateFormatter(
    i18n.language,
    getCalendars()[0]?.uses24hourClock ?? true,
    i18n.t,
  );
  const time = formatTime(remindAt);

  const ids: string[] = [];

  for (const [index, offset] of offsets.entries()) {
    const date = new Date(remindAt.getTime() + offset * Duration.MINUTE);
    if (date.getTime() <= now) {
      continue;
    }

    const isFirst = index === 0;
    const id = await api.scheduleNotificationAsync({
      identifier: notificationIdFor(task.id, index),
      content: {
        title: isFirst ? task.title : `🔥 ${task.title}`,
        body: isFirst
          ? i18n.t('notifications.body', { time })
          : i18n.t('notifications.overdueBody', { time }),
        data: { taskId: task.id },
        categoryIdentifier: REMINDER_CATEGORY,
      },
      trigger: {
        type: api.SchedulableTriggerInputTypes.DATE,
        date,
        channelId: channelIdFor(vibration),
      },
    });
    ids.push(id);
  }

  return ids;
}

/** Отменяет запланированные (ещё не показанные) уведомления задачи. */
export async function cancelScheduledTaskNotifications(taskId: string): Promise<void> {
  const api = Notifications;
  if (!api) {
    return;
  }

  await Promise.all(
    ESCALATION_OFFSETS_MIN.map((_, index) =>
      api.cancelScheduledNotificationAsync(notificationIdFor(taskId, index)),
    ),
  );
}

/** Отменяет запланированные уведомления задачи и убирает уже показанные из шторки. */
export async function cancelTaskNotifications(taskId: string): Promise<void> {
  await cancelScheduledTaskNotifications(taskId);
  await dismissTaskNotifications(taskId);
}

/** id уведомлений задачи, которые ещё должны сработать (с учётом режима повторов). */
export function expectedNotificationIds(task: Task, now = Date.now()): string[] {
  if (task.completedAt) {
    return [];
  }

  const { escalation } = useSettings.getState();
  const offsets = escalation ? ESCALATION_OFFSETS_MIN : ESCALATION_OFFSETS_MIN.slice(0, 1);
  const remindAt = new Date(task.remindAt).getTime();

  return offsets.flatMap((offset, index) =>
    remindAt + offset * Duration.MINUTE > now ? [notificationIdFor(task.id, index)] : [],
  );
}

/** Убирает из шторки показанные уведомления задачи. */
export async function dismissTaskNotifications(taskId: string): Promise<void> {
  const api = Notifications;
  if (!api) {
    return;
  }

  const presented = await api.getPresentedNotificationsAsync();

  await Promise.all(
    presented
      .filter((notification) => notification.request.content.data?.taskId === taskId)
      .map((notification) =>
        api.dismissNotificationAsync(notification.request.identifier),
      ),
  );
}
