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
    deleted: 'Task deleted',
  },
  common: {
    undo: 'Undo',
    cancel: 'Cancel',
    delete: 'Delete',
    close: 'Close',
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
    editPlaceholder: 'Task {{id}}',
    titlePlaceholder: 'What needs to be done?',
    remindAt: 'Remind me',
    save: 'Save',
    chips: {
      inHour: 'In an hour',
      today: 'Today {{time}}',
      tomorrow: 'Tomorrow {{time}}',
    },
    pastError: 'Choose a time in the future',
    markDone: 'Mark as done',
    markUndone: 'Mark as not done',
    delete: 'Delete task',
    deleteConfirmTitle: 'Delete task?',
    deleteConfirmMessage: 'This can’t be undone.',
    discardTitle: 'Discard changes?',
    discardMessage: 'Your changes will be lost.',
    keepEditing: 'Keep editing',
    discard: 'Discard',
    notFound: 'Task not found',
    notFoundHint: 'It may have been deleted',
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
