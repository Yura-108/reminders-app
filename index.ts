// Собственная точка входа: фоновая задача уведомлений должна быть объявлена
// до загрузки приложения — Android может запустить JS только ради неё (без UI).
import './src/features/notifications/background-task';

// Expo Router — всегда последним.
import 'expo-router/entry';
