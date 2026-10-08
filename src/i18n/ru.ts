import type { Translation } from './en';

const ru: Translation = {
  tabs: {
    tasks: 'Задачи',
    calendar: 'Календарь',
    add: 'Добавить',
    birthdays: 'Дни рождения',
    settings: 'Настройки',
  },
  tasks: {
    sections: {
      burning: 'Горящие',
      today: 'Сегодня',
      tomorrow: 'Завтра',
      later: 'Позже',
      done: 'Выполненные',
    },
    emptyTitle: 'Задач пока нет',
    emptyHint: 'Нажмите +, чтобы добавить первую',
    markDone: 'Отметить выполненной',
    markUndone: 'Вернуть в работу',
    devAdd: 'Добавить тестовую задачу (dev)',
  },
  date: {
    tomorrowAt: 'завтра, {{time}}',
    yesterdayAt: 'вчера, {{time}}',
    dayAt: '{{day}}, {{time}}',
  },
  calendar: {
    placeholder: 'Здесь будет календарь с задачами',
  },
  birthdays: {
    placeholder: 'Скоро здесь будут дни рождения',
  },
  task: {
    newTitle: 'Новая задача',
    editTitle: 'Задача',
    addA11y: 'Добавить задачу',
    newPlaceholder: 'Здесь будет форма создания задачи',
    editPlaceholder: 'Задача {{id}}',
  },
  snooze: {
    title: 'Перенести',
  },
  settings: {
    theme: 'Тема',
    language: 'Язык',
    themes: {
      system: 'Системная',
      light: 'Светлая',
      dark: 'Тёмная',
    },
    languages: {
      system: 'Системный',
      ru: 'Русский',
      en: 'English',
    },
  },
};

export default ru;
