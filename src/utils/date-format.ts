import type { TFunction } from 'i18next';

import { calendarDayDiff } from '@/utils/date';

/**
 * Форматтеры дат для заданного языка. Обычная функция (не хук), поэтому её можно вызывать
 * и вне компонентов — например, при формировании текста уведомления.
 */
export function createDateFormatter(locale: string, uses24hourClock: boolean, t: TFunction) {
  const timeFormat = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: !uses24hourClock,
  });
  const dayFormat = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
  const dayWithYearFormat = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const fullDayFormat = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const formatTime = (date: Date) => timeFormat.format(date);

  /** «ср, 8 окт.» — для поля даты в форме. */
  const formatDate = (date: Date) => fullDayFormat.format(date);

  /** «19:30», «завтра, 9:00», «вчера, 18:00», «12 окт., 9:00». */
  const formatWhen = (date: Date, now: Date) => {
    const time = formatTime(date);
    const dayDiff = calendarDayDiff(date, now);

    if (dayDiff === 0) return time;
    if (dayDiff === 1) return t('date.tomorrowAt', { time });
    if (dayDiff === -1) return t('date.yesterdayAt', { time });

    const day =
      date.getFullYear() === now.getFullYear()
        ? dayFormat.format(date)
        : dayWithYearFormat.format(date);

    return t('date.dayAt', { day, time });
  };

  return { formatTime, formatDate, formatWhen, uses24hourClock };
}
