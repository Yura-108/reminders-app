import { calendarDayDiff, startOfDay, toDayKey } from '@/utils/date';

import type { Birthday } from './types';

function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Дата дня рождения в указанном году (полночь). 29 февраля в невисокосный год → 28 февраля. */
export function birthdayInYear(birthday: Pick<Birthday, 'day' | 'month'>, year: number): Date {
  const day = birthday.month === 2 && birthday.day === 29 && !isLeapYear(year) ? 28 : birthday.day;
  return new Date(year, birthday.month - 1, day);
}

/** Ближайший день рождения: сегодня или позже. */
export function nextOccurrence(birthday: Birthday, now: Date): Date {
  const today = startOfDay(now);
  const thisYear = birthdayInYear(birthday, today.getFullYear());

  return thisYear.getTime() >= today.getTime()
    ? thisYear
    : birthdayInYear(birthday, today.getFullYear() + 1);
}

/** Сколько дней до ближайшего дня рождения: 0 — сегодня. */
export function daysUntil(birthday: Birthday, now: Date): number {
  return calendarDayDiff(nextOccurrence(birthday, now), now);
}

/** Сколько исполнится в ближайший день рождения; null, если год неизвестен. */
export function upcomingAge(birthday: Birthday, now: Date): number | null {
  return birthday.year === null ? null : nextOccurrence(birthday, now).getFullYear() - birthday.year;
}

export type BirthdaySectionKey = 'today' | 'upcoming';

export type BirthdaySection = {
  key: BirthdaySectionKey;
  data: Birthday[];
};

/** Секции списка (SPEC 12.1): сегодняшние сверху, дальше — по ближайшей дате, при равенстве — по имени. */
export function buildBirthdaySections(birthdays: Birthday[], now: Date): BirthdaySection[] {
  const sorted = [...birthdays].sort(
    (a, b) => daysUntil(a, now) - daysUntil(b, now) || a.name.localeCompare(b.name),
  );
  const today = sorted.filter((birthday) => daysUntil(birthday, now) === 0);
  const upcoming = sorted.filter((birthday) => daysUntil(birthday, now) > 0);

  return [
    { key: 'today' as const, data: today },
    { key: 'upcoming' as const, data: upcoming },
  ].filter((section) => section.data.length > 0);
}

/** Дни 'YYYY-MM-DD', на которые выпадают дни рождения в указанных годах (для точек в календаре). */
export function birthdayDayKeys(birthdays: Birthday[], years: number[]): Set<string> {
  const keys = new Set<string>();
  for (const birthday of birthdays) {
    for (const year of years) {
      if (isBornBy(birthday, year)) {
        keys.add(toDayKey(birthdayInYear(birthday, year)));
      }
    }
  }
  return keys;
}

/** Дни рождения, которые выпадают на этот день (с учётом 29 февраля → 28 в невисокосный год). */
export function birthdaysOnDay(birthdays: Birthday[], day: Date): Birthday[] {
  const key = toDayKey(day);
  return birthdays
    .filter((birthday) => isBornBy(birthday, day.getFullYear()))
    .filter((birthday) => toDayKey(birthdayInYear(birthday, day.getFullYear())) === key)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Сколько исполняется в день рождения в году даты `date`; null, если год неизвестен или это год рождения. */
export function ageInYearOf(birthday: Birthday, date: Date): number | null {
  if (birthday.year === null) return null;
  const age = date.getFullYear() - birthday.year;
  return age > 0 ? age : null;
}

/** Человек уже родился к этому году (год неизвестен — считаем, что да). */
function isBornBy(birthday: Birthday, year: number) {
  return birthday.year === null || year >= birthday.year;
}

export function countBirthdaysToday(birthdays: Birthday[], now: Date): number {
  return birthdaysOnDay(birthdays, now).length;
}
