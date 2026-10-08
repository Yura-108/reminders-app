import { useCalendars } from 'expo-localization';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { createDateFormatter } from '@/utils/date-format';

/**
 * Форматирование дат на текущем языке. Формат времени (24ч / 12ч) — как в системе.
 */
export function useDateFormat() {
  const { t, i18n } = useTranslation();
  const uses24hourClock = useCalendars()[0]?.uses24hourClock ?? true;
  const locale = i18n.language;

  return useMemo(
    () => createDateFormatter(locale, uses24hourClock, t),
    [locale, uses24hourClock, t],
  );
}
