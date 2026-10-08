import type { NotificationPermissionsStatus } from 'expo-notifications';
import { create } from 'zustand';

import { Notifications } from './module';

type PermissionStatus = 'granted' | 'denied' | 'undetermined';

type PermissionState = {
  status: PermissionStatus;
  /** Перечитать статус (пользователь мог изменить его в настройках системы). */
  refresh: () => Promise<void>;
  /**
   * Запросить разрешение, если его ещё нет и система позволяет спросить (SPEC 4.4).
   * Вызывается при первом сохранении задачи, а не при запуске приложения.
   */
  ensure: () => Promise<boolean>;
};

function toStatus({ granted, status }: NotificationPermissionsStatus): PermissionStatus {
  if (granted) return 'granted';
  return status === 'denied' ? 'denied' : 'undetermined';
}

export const useNotificationPermission = create<PermissionState>()((set) => ({
  status: 'undetermined',

  refresh: async () => {
    if (Notifications) {
      set({ status: toStatus(await Notifications.getPermissionsAsync()) });
    }
  },

  ensure: async () => {
    const api = Notifications;
    if (!api) {
      return false;
    }

    const current = await api.getPermissionsAsync();
    if (current.granted || !current.canAskAgain) {
      set({ status: toStatus(current) });
      return current.granted;
    }

    const requested = await api.requestPermissionsAsync();
    set({ status: toStatus(requested) });
    return requested.granted;
  },
}));
