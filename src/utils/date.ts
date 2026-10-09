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

/** Та же дата, но с указанным временем (секунды обнуляются). */
export function atTime(date: Date, hours: number, minutes = 0): Date {
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

/** Дата (год/месяц/день) из `datePart`, время — из `base`. */
export function withDatePart(base: Date, datePart: Date): Date {
  const result = new Date(base);
  result.setFullYear(datePart.getFullYear(), datePart.getMonth(), datePart.getDate());
  return result;
}

/** Время (часы/минуты) из `timePart`, дата — из `base`. Секунды обнуляются. */
export function withTimePart(base: Date, timePart: Date): Date {
  return atTime(base, timePart.getHours(), timePart.getMinutes());
}

/** Обрезает секунды и миллисекунды. */
export function startOfMinute(date: Date): Date {
  const result = new Date(date);
  result.setSeconds(0, 0);
  return result;
}

/** Разбирает 'YYYY-MM-DD' в локальную полночь. Некорректная строка → null. */
export function parseDayParam(value: string | undefined): Date | null {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Начало недели — понедельник 00:00 (локальное время) той недели, в которую попадает `date`. */
export function startOfWeekMonday(date: Date): Date {
  const result = startOfDay(date);
  // getDay(): 0 — воскресенье, 1 — понедельник … 6 — суббота.
  const daysSinceMonday = (result.getDay() + 6) % 7;
  return addDays(result, -daysSinceMonday);
}

/** Ключ дня 'YYYY-MM-DD' по местному времени (формат дат календаря и параметра `?date=`). */
export function toDayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Календарная дата без времени (день рождения и т.п.): месяц 1..12, время — полдень.
 * Не полночь — потому что для прошлых лет движок JS и Intl могут по-разному считать смещение
 * часового пояса (например, в 2003 году оно было другим), и полночь при показе «уезжает»
 * на предыдущий день. Полдень от такого сдвига на час-два защищён.
 */
export function calendarDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day, 12);
}
