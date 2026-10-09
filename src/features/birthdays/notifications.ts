import { channelIdFor } from '@/features/notifications/constants';
import { Notifications } from '@/features/notifications/module';
import { useSettings } from '@/features/settings/store';
import i18n from '@/i18n';
import { addDays } from '@/utils/date';

import { birthdayInYear } from './selectors';
import { REMIND_DAY_OPTIONS, type Birthday } from './types';

/** Префикс id уведомлений дней рождения — чтобы не путать их с уведомлениями задач. */
export const BIRTHDAY_NOTIFICATION_PREFIX = 'birthday-';

/** id уведомления: `birthday-<id>:<за сколько дней>`. */
export function birthdayNotificationId(birthdayId: string, daysBefore: number) {
  return `${BIRTHDAY_NOTIFICATION_PREFIX}${birthdayId}:${daysBefore}`;
}

/** id дня рождения из id уведомления; null — это уведомление не дня рождения. */
export function birthdayIdFromNotificationId(notificationId: string): string | null {
  if (!notificationId.startsWith(BIRTHDAY_NOTIFICATION_PREFIX)) {
    return null;
  }
  const rest = notificationId.slice(BIRTHDAY_NOTIFICATION_PREFIX.length);
  const separator = rest.lastIndexOf(':');
  return separator > 0 ? rest.slice(0, separator) : null;
}

/** Ожидаемые id уведомлений дня рождения — по выбранным вариантам «за сколько дней». */
export function expectedBirthdayNotificationIds(birthday: Birthday): string[] {
  return birthday.remindDays.map((days) => birthdayNotificationId(birthday.id, days));
}

/**
 * День и месяц срабатывания для «за N дней». Считаем по невисокосному году (SPEC 12.5):
 * 29 февраля → 28 февраля; в високосный год напоминание для 1–7 марта может прийти на день раньше.
 */
function triggerDayMonth(birthday: Birthday, daysBefore: number) {
  const date = addDays(birthdayInYear(birthday, 2001), -daysBefore);
  // Месяц в триггере YEARLY — как у JS Date: январь = 0.
  return { day: date.getDate(), month: date.getMonth() };
}

/**
 * Планирует ежегодные уведомления дня рождения (SPEC 12.5): по одному на каждый вариант
 * «за сколько дней». Возвращает id запланированных уведомлений.
 */
export async function scheduleBirthdayNotifications(birthday: Birthday): Promise<string[]> {
  const api = Notifications;
  if (!api) {
    return [];
  }

  const { vibration } = useSettings.getState();
  const dateLabel = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'long' }).format(
    birthdayInYear(birthday, 2000),
  );
  const ids: string[] = [];

  for (const daysBefore of birthday.remindDays) {
    const { day, month } = triggerDayMonth(birthday, daysBefore);
    const isOnTheDay = daysBefore === 0;

    const id = await api.scheduleNotificationAsync({
      identifier: birthdayNotificationId(birthday.id, daysBefore),
      content: {
        // Без возраста: ежегодное уведомление не может менять текст год от года (SPEC 12.5).
        title: isOnTheDay
          ? i18n.t('birthdayNotifications.todayTitle', { name: birthday.name })
          : i18n.t('birthdayNotifications.soonTitle', { name: birthday.name }),
        body: isOnTheDay
          ? i18n.t('birthdayNotifications.todayBody')
          : i18n.t('birthdayNotifications.soonBody', { count: daysBefore, date: dateLabel }),
        data: { birthdayId: birthday.id },
      },
      trigger: {
        type: api.SchedulableTriggerInputTypes.YEARLY,
        day,
        month,
        hour: Math.floor(birthday.remindMinutes / 60),
        minute: birthday.remindMinutes % 60,
        channelId: channelIdFor(vibration),
      },
    });
    ids.push(id);
  }

  return ids;
}

/** Отменяет уведомления дня рождения (все возможные варианты) и убирает показанные из шторки. */
export async function cancelBirthdayNotifications(birthdayId: string): Promise<void> {
  const api = Notifications;
  if (!api) {
    return;
  }

  await Promise.all(
    REMIND_DAY_OPTIONS.map((days) =>
      api.cancelScheduledNotificationAsync(birthdayNotificationId(birthdayId, days)),
    ),
  );

  const presented = await api.getPresentedNotificationsAsync();
  await Promise.all(
    presented
      .filter((notification) => notification.request.content.data?.birthdayId === birthdayId)
      .map((notification) => api.dismissNotificationAsync(notification.request.identifier)),
  );
}
