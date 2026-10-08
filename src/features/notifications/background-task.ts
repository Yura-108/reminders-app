import type { NotificationTaskPayload } from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

import { useTasks } from '@/features/tasks/store';

import { BACKGROUND_NOTIFICATION_TASK, NotificationAction } from './constants';
import { Notifications } from './module';

/**
 * Кнопка «Выполнено», когда приложение свёрнуто или закрыто (SPEC 4.5).
 * На Android система запускает этот код в фоне без открытия приложения.
 * Модуль подключается в index.ts до загрузки роутера: задача должна быть объявлена сразу при старте JS.
 */
if (Notifications) {
  TaskManager.defineTask<NotificationTaskPayload>(
    BACKGROUND_NOTIFICATION_TASK,
    async ({ data, error }) => {
      if (error || !('actionIdentifier' in data)) {
        return;
      }
      if (data.actionIdentifier !== NotificationAction.DONE) {
        return;
      }

      const taskId = data.notification.request.content.data?.taskId;
      if (typeof taskId !== 'string') {
        return;
      }

      // В фоне приложение могло ещё не загрузить задачи.
      await useTasks.getState().init();
      // setDone идемпотентна: если приложение живо, ответ придёт ещё и в слушатель — это не страшно.
      await useTasks.getState().setDone(taskId, true);
    },
  );

  Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK).catch((error) =>
    console.warn('Failed to register notification task', error),
  );
}
