import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState } from 'react-native';

import { useSettings } from '@/features/settings/store';
import { useTasks } from '@/features/tasks/store';

import { useNotificationPermission } from './permissions';
import { setupNotifications } from './setup';
import { reconcileNotifications } from './sync';

/**
 * Всё, что касается уведомлений на уровне приложения:
 * - при запуске: каналы и кнопки, статус разрешения, сверка с задачами;
 * - при возврате на передний план: перечитать задачи (их могла изменить фоновая задача) и разрешение;
 * - при смене языка, вибрации или режима повторов: перепланировать уведомления.
 */
export function useNotificationsLifecycle() {
  const ready = useTasks((s) => s.ready);
  const { i18n } = useTranslation();
  const language = i18n.language;
  const vibration = useSettings((s) => s.vibration);
  const escalation = useSettings((s) => s.escalation);

  useEffect(() => {
    useNotificationPermission.getState().refresh();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        useTasks.getState().reload();
        useNotificationPermission.getState().refresh();
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    setupNotifications()
      .then(reconcileNotifications)
      .catch((error) => console.warn('Notifications setup failed', error));
  }, [ready]);

  // Текст и канал уведомления фиксируются при планировании, поэтому при смене настроек — перепланировать.
  const previous = useRef({ language, vibration, escalation });
  useEffect(() => {
    const prev = previous.current;
    previous.current = { language, vibration, escalation };
    if (!ready) {
      return;
    }

    const languageChanged = prev.language !== language;
    if (!languageChanged && prev.vibration === vibration && prev.escalation === escalation) {
      return;
    }

    (languageChanged ? setupNotifications() : Promise.resolve())
      .then(() => useTasks.getState().rescheduleAll())
      .catch((error) => console.warn('Rescheduling failed', error));
  }, [ready, language, vibration, escalation]);
}
