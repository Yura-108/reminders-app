/**
 * Английский словарь — эталон: его структура задаёт типы ключей для `t()`.
 * Новые ключи добавляем сначала сюда, потом в ru.ts (TypeScript подскажет, если забыть).
 */
const en = {
  tabs: {
    tasks: 'Tasks',
    calendar: 'Calendar',
    add: 'Add',
    birthdays: 'Birthdays',
    settings: 'Settings',
  },
  tasks: {
    sections: {
      burning: 'Overdue',
      today: 'Today',
      tomorrow: 'Tomorrow',
      later: 'Later',
      done: 'Completed',
    },
    emptyTitle: 'No tasks yet',
    emptyHint: 'Tap + to add your first task',
    markDone: 'Mark as done',
    markUndone: 'Mark as not done',
    devAdd: 'Add test task (dev)',
  },
  date: {
    tomorrowAt: 'tomorrow, {{time}}',
    yesterdayAt: 'yesterday, {{time}}',
    dayAt: '{{day}}, {{time}}',
  },
  calendar: {
    placeholder: 'Your calendar with tasks will be here',
  },
  birthdays: {
    placeholder: 'Birthdays are coming soon',
  },
  task: {
    newTitle: 'New task',
    editTitle: 'Task',
    addA11y: 'Add task',
    newPlaceholder: 'The task form will be here',
    editPlaceholder: 'Task {{id}}',
  },
  snooze: {
    title: 'Snooze',
  },
  settings: {
    theme: 'Theme',
    language: 'Language',
    themes: {
      system: 'System',
      light: 'Light',
      dark: 'Dark',
    },
    languages: {
      system: 'System',
      ru: 'Русский',
      en: 'English',
    },
  },
};

export default en;

/** Та же структура, но значения — любые строки (для перевода на другие языки). */
type DeepStrings<T> = { [K in keyof T]: T[K] extends string ? string : DeepStrings<T[K]> };

export type Translation = DeepStrings<typeof en>;
