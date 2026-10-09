import type { MaybeNotificationResponse } from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';

import { useBirthdays } from '@/features/birthdays/store';
import { useTasks } from '@/features/tasks/store';

import { NotificationAction } from './constants';
import { Notifications } from './module';
import { dismissTaskNotifications } from './schedule';

/** Без модуля уведомлений (Expo Go) ответов нет. Выбор делается один раз при загрузке модуля. */
const useLastResponse: () => MaybeNotificationResponse =
  Notifications?.useLastNotificationResponse ?? (() => undefined);

/**
 * Реакция на нажатия по уведомлению, когда приложение открыто или открывается из уведомления:
 * - тап по уведомлению → экран задачи;
 * - «Перенести» → меню переноса;
 * - «Выполнено» → отметить (если приложение живо; иначе это делает фоновая задача);
 * - тап по уведомлению о дне рождения → форма этого дня рождения.
 * Ждём загрузки данных, иначе экран откроется пустым.
 */
export function useNotificationResponses() {
  const response = useLastResponse();
  const tasksReady = useTasks((s) => s.ready);
  const birthdaysReady = useBirthdays((s) => s.ready);
  const ready = tasksReady && birthdaysReady;

  useEffect(() => {
    if (!ready || !response || !Notifications) {
      return;
    }

    // Ответ обработан — убираем, чтобы не повторить его при следующем рендере.
    Notifications.clearLastNotificationResponse();

    const data = response.notification.request.content.data;

    if (typeof data?.birthdayId === 'string') {
      router.push({ pathname: '/birthday/[id]', params: { id: data.birthdayId } });
      return;
    }

    const taskId = data?.taskId;
    if (typeof taskId !== 'string') {
      return;
    }

    switch (response.actionIdentifier) {
      case NotificationAction.DONE:
        useTasks.getState().setDone(taskId, true);
        break;
      case NotificationAction.SNOOZE:
        dismissTaskNotifications(taskId);
        router.push({ pathname: '/task/snooze/[id]', params: { id: taskId } });
        break;
      case Notifications.DEFAULT_ACTION_IDENTIFIER:
        router.push({ pathname: '/task/[id]', params: { id: taskId } });
        break;
    }
  }, [response, ready]);
}
