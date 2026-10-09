export type Birthday = {
  id: string;
  name: string;
  /** День месяца 1..31 */
  day: number;
  /** Месяц 1..12 */
  month: number;
  /** Год рождения; null — неизвестен (тогда возраст не показываем) */
  year: number | null;
  /** Время напоминания: минуты от полуночи (9:00 → 540) */
  remindMinutes: number;
  /** За сколько дней напоминать: 0 — в сам день */
  remindDays: number[];
  /** id контакта, если добавлен из контактов (защита от дублей при импорте) */
  contactId: string | null;
  /** id запланированных уведомлений (этап Д3) */
  notificationIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type BirthdayInput = Pick<
  Birthday,
  'name' | 'day' | 'month' | 'year' | 'remindMinutes' | 'remindDays' | 'contactId'
>;

/** Варианты «за сколько дней напомнить» (SPEC 12.3). */
export const REMIND_DAY_OPTIONS = [0, 1, 3, 7] as const;

export const DEFAULT_REMIND_MINUTES = 9 * 60;
export const DEFAULT_REMIND_DAYS = [0];
export const NAME_MAX_LENGTH = 100;
