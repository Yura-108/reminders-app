import type { VibrationPreset } from '@/features/settings/types';

/** Категория уведомления-напоминания: задаёт кнопки «Выполнено» и «Перенести» (SPEC 4.5). */
export const REMINDER_CATEGORY = 'task-reminder';

export const NotificationAction = {
  DONE: 'done',
  SNOOZE: 'snooze',
} as const;

/** Фоновая задача, которая обрабатывает «Выполнено», когда приложение свёрнуто или закрыто. */
export const BACKGROUND_NOTIFICATION_TASK = 'reminders-notification-action';

/**
 * Эскалация (SPEC 4.1): смещения от времени задачи T в минутах.
 * Первое — само напоминание, остальные — повторы, пока задача не выполнена.
 */
export const ESCALATION_OFFSETS_MIN = [0, 5, 15, 30, 60, 120, 240];

/** На Android вибрация задаётся каналом, а канал после создания не меняется — по каналу на пресет. */
export const VIBRATION_PATTERNS: Record<VibrationPreset, number[] | null> = {
  none: null,
  short: [0, 250],
  long: [0, 1000],
  pulse: [0, 200, 150, 200, 150, 200],
};

export function channelIdFor(preset: VibrationPreset) {
  return `reminders-${preset}`;
}

/** id уведомления: `<taskId>:<номер в эскалации>`. По нему находим и отменяем уведомления задачи. */
export function notificationIdFor(taskId: string, index: number) {
  return `${taskId}:${index}`;
}

export function taskIdFromNotificationId(notificationId: string): string | null {
  const separator = notificationId.lastIndexOf(':');
  return separator > 0 ? notificationId.slice(0, separator) : null;
}
