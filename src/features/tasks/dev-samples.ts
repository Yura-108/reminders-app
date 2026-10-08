import { addDays, Duration } from '@/utils/date';

import type { NewTask } from './types';

const TITLES = [
  'Позвонить врачу',
  'Забрать посылку',
  'Оплатить интернет',
  'Купить продукты: молоко, хлеб, яйца, сыр, яблоки и что-нибудь к чаю',
  'Написать отчёт',
  'Полить цветы',
];

/** Время относительно «сейчас»: прошлое (горящие), сегодня, завтра, позже. */
const OFFSETS = [
  () => new Date(Date.now() - 2 * Duration.HOUR),
  () => addDays(new Date(), -1),
  () => new Date(Date.now() + 30 * Duration.MINUTE),
  () => new Date(Date.now() + 3 * Duration.HOUR),
  () => addDays(new Date(), 1),
  () => addDays(new Date(), 5),
];

let counter = 0;

/**
 * Тестовая задача для разработки (только в __DEV__): по кругу перебирает тексты и времена,
 * чтобы быстро наполнить все секции списка. Уйдёт, когда появится форма (этап 4).
 */
export function makeSampleTask(): NewTask {
  const index = counter++;
  const remindAt = OFFSETS[index % OFFSETS.length]();
  remindAt.setSeconds(0, 0);

  return {
    title: TITLES[index % TITLES.length],
    remindAt: remindAt.toISOString(),
  };
}
