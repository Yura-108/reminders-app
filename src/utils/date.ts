const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const Duration = { MINUTE, HOUR, DAY } as const;

/** Полночь (локальное время) того же дня. */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/** Сдвиг на `days` календарных дней (корректно через переход на летнее время). */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Разница в календарных днях: 0 — тот же день, 1 — завтра, -1 — вчера. */
export function calendarDayDiff(date: Date, relativeTo: Date): number {
  const diff = startOfDay(date).getTime() - startOfDay(relativeTo).getTime();
  return Math.round(diff / DAY);
}

/** Ближайший следующий целый час: 14:20 → 15:00, 14:00 → 15:00. */
export function nextFullHour(from: Date): Date {
  const result = new Date(from);
  result.setHours(result.getHours() + 1, 0, 0, 0);
  return result;
}
