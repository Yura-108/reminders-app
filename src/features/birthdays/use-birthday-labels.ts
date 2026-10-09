import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { daysUntil, nextOccurrence, upcomingAge } from './selectors';
import type { Birthday } from './types';

/**
 * Подписи для дня рождения на текущем языке:
 * дата («14 окт.»), когда («сегодня», «через 6 дней») и возраст («исполнится 25»).
 */
export function useBirthdayLabels() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  return useMemo(() => {
    const dateFormat = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });

    return (birthday: Birthday, now: Date) => {
      const days = daysUntil(birthday, now);
      const age = upcomingAge(birthday, now);

      const when =
        days === 0
          ? t('birthdays.today')
          : days === 1
            ? t('birthdays.tomorrow')
            : t('birthdays.inDays', { count: days });

      return {
        date: dateFormat.format(nextOccurrence(birthday, now)),
        when,
        age:
          age === null ? null : t(days === 0 ? 'birthdays.turnedAge' : 'birthdays.turnsAge', { age }),
        isToday: days === 0,
      };
    };
  }, [locale, t]);
}
