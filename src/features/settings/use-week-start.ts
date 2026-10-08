import { useCalendars } from 'expo-localization';

import { useSettings } from './store';
import type { WeekStartPreference } from './types';

/** Номер дня недели: 0 — воскресенье, 1 — понедельник … 6 — суббота (как у Date.getDay()). */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Первый день недели по настройке. «Как в системе» берётся из региональных настроек телефона
 * (expo-localization отдаёт 1 = воскресенье … 7 = суббота); если система не сообщает — понедельник.
 */
export function resolveWeekStart(
  preference: WeekStartPreference,
  systemFirstWeekday: number | null | undefined,
): DayOfWeek {
  if (preference === 'monday') return 1;
  if (preference === 'sunday') return 0;
  if (!systemFirstWeekday) return 1;

  return ((systemFirstWeekday - 1) % 7) as DayOfWeek;
}

export function useWeekStart(): DayOfWeek {
  const preference = useSettings((s) => s.weekStart);
  const systemFirstWeekday = useCalendars()[0]?.firstWeekday;

  return resolveWeekStart(preference, systemFirstWeekday);
}
