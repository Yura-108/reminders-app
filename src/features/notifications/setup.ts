import type { VibrationPreset } from '@/features/settings/types';
import i18n from '@/i18n';

import {
  channelIdFor,
  NotificationAction,
  REMINDER_CATEGORY,
  VIBRATION_PATTERNS,
} from './constants';
import { Notifications } from './module';

// Показывать уведомление, даже если приложение открыто (SPEC 4.5).
Notifications?.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Каналы вибрации и кнопки уведомления. Вызывается при запуске и при смене языка:
 * повторный вызов обновляет только названия (остальное Android менять не даёт — и не нужно).
 */
export async function setupNotifications() {
  const api = Notifications;
  if (!api) {
    return;
  }

  const presets = Object.keys(VIBRATION_PATTERNS) as VibrationPreset[];

  await Promise.all(
    presets.map((preset) => {
      const pattern = VIBRATION_PATTERNS[preset];

      return api.setNotificationChannelAsync(channelIdFor(preset), {
        name: i18n.t(`notifications.channels.${preset}`),
        importance: api.AndroidImportance.HIGH,
        enableVibrate: pattern !== null,
        vibrationPattern: pattern,
      });
    }),
  );

  await api.setNotificationCategoryAsync(REMINDER_CATEGORY, [
    {
      identifier: NotificationAction.DONE,
      buttonTitle: i18n.t('notifications.actions.done'),
      // Без открытия приложения: обработает фоновая задача (background-task.ts).
      options: { opensAppToForeground: false },
    },
    {
      identifier: NotificationAction.SNOOZE,
      buttonTitle: i18n.t('notifications.actions.snooze'),
      // Открывает приложение сразу на меню переноса.
      options: { opensAppToForeground: true },
    },
  ]);
}
