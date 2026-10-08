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
    deleted: 'Задача удалена',
  },
  common: {
    undo: 'Отменить',
    cancel: 'Отмена',
    delete: 'Удалить',
    close: 'Закрыть',
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
    editPlaceholder: 'Задача {{id}}',
    titlePlaceholder: 'Что нужно сделать?',
    remindAt: 'Напомнить',
    save: 'Сохранить',
    chips: {
      inHour: 'Через час',
      today: 'Сегодня {{time}}',
      tomorrow: 'Завтра {{time}}',
    },
    pastError: 'Выберите время в будущем',
    markDone: 'Выполнено',
    markUndone: 'Вернуть в работу',
    delete: 'Удалить задачу',
    deleteConfirmTitle: 'Удалить задачу?',
    deleteConfirmMessage: 'Это действие нельзя отменить.',
    discardTitle: 'Отменить изменения?',
    discardMessage: 'Внесённые изменения будут потеряны.',
    keepEditing: 'Продолжить',
    discard: 'Отменить изменения',
    notFound: 'Задача не найдена',
    notFoundHint: 'Возможно, она была удалена',
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
