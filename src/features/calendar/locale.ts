import { LocaleConfig } from 'react-native-calendars';

import i18n from '@/i18n';

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Регистрирует названия месяцев и дней недели для react-native-calendars.
 * Берём их из Intl, а не пишем руками — тогда любой язык работает сам.
 */
export function applyCalendarLocale(language: string) {
  // 2024 год: январь 2024 начинается с понедельника, поэтому 7 января — воскресенье.
  const months = Array.from({ length: 12 }, (_, month) => new Date(2024, month, 1));
  const weekdays = Array.from({ length: 7 }, (_, day) => new Date(2024, 0, 7 + day));
  const format = (options: Intl.DateTimeFormatOptions) => (date: Date) =>
    capitalize(new Intl.DateTimeFormat(language, options).format(date));

  LocaleConfig.locales[language] = {
    monthNames: months.map(format({ month: 'long' })),
    monthNamesShort: months.map(format({ month: 'short' })),
    // Календарь ожидает дни недели начиная с воскресенья, даже если неделя начинается с понедельника.
    dayNames: weekdays.map(format({ weekday: 'long' })),
    dayNamesShort: weekdays.map(format({ weekday: 'short' })),
    today: '',
  };
  LocaleConfig.defaultLocale = language;
}

// Применяем язык сразу и при каждой его смене — до того, как календарь отрисуется.
applyCalendarLocale(i18n.language);
i18n.on('languageChanged', applyCalendarLocale);
