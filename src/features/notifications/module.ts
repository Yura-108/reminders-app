import { isRunningInExpoGo } from 'expo';
import type * as NotificationsModule from 'expo-notifications';

/**
 * Модуль expo-notifications или null, если уведомления недоступны.
 *
 * В Expo Go на Android (SDK 53+) пакет падает уже при импорте: при загрузке он регистрирует
 * слушатель push-токена, а push в Expo Go убран. Поэтому подгружаем его только в собственной
 * сборке (development build / APK), а в Expo Go уведомления просто отключены —
 * остальное приложение продолжает работать.
 */
export const Notifications: typeof NotificationsModule | null = isRunningInExpoGo()
  ? null
  : // eslint-disable-next-line @typescript-eslint/no-require-imports -- условная загрузка, см. выше
    require('expo-notifications');
