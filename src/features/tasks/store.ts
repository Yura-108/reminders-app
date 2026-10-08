import { randomUUID } from 'expo-crypto';
import { create } from 'zustand';

import {
  cancelScheduledTaskNotifications,
  cancelTaskNotifications,
  dismissTaskNotifications,
  scheduleTaskNotifications,
} from '@/features/notifications/schedule';
import { startOfWeekMonday } from '@/utils/date';

import * as repository from './repository';
import type { NewTask, Task, TaskPatch } from './types';

type TasksState = {
  tasks: Task[];
  /** true, когда задачи загружены из БД */
  ready: boolean;
  init: () => Promise<void>;
  /** Перечитать задачи из БД (их могла изменить фоновая задача уведомлений). */
  reload: () => Promise<void>;
  addTask: (input: NewTask) => Promise<Task>;
  updateTask: (id: string, patch: TaskPatch) => Promise<void>;
  toggleDone: (id: string) => Promise<void>;
  /** Идемпотентная отметка: повторный вызов с тем же значением ничего не меняет. */
  setDone: (id: string, done: boolean) => Promise<void>;
  /** Перенести напоминание: новое время и полный цикл уведомлений заново (SPEC 4.5). */
  snoozeTask: (id: string, until: Date) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  /** Вернуть удалённую задачу как была (кнопка «Отменить» в снэкбаре). */
  restoreTask: (task: Task) => Promise<void>;
  /** Перепланировать уведомления всех задач (смена языка, вибрации, режима повторов). */
  rescheduleAll: () => Promise<void>;
  /**
   * Пересоздать запланированные уведомления задачи по её текущему состоянию.
   * `dismiss` — заодно убрать уже показанные из шторки (задача выполнена, перенесена, время изменено).
   */
  syncNotifications: (id: string, options?: { dismiss?: boolean }) => Promise<void>;
  /**
   * Еженедельная очистка (SPEC 5.4): удаляет задачи, выполненные до последней полуночи
   * с воскресенья на понедельник. Безопасно вызывать сколько угодно раз.
   */
  cleanupCompleted: (now?: Date) => Promise<void>;
};

/** Поля, от которых зависят уведомления задачи. */
const NOTIFICATION_FIELDS: (keyof TaskPatch)[] = ['title', 'remindAt', 'completedAt'];

/**
 * Задачи в памяти + действия над ними. Каждое действие сначала обновляет состояние
 * (UI реагирует мгновенно), затем сохраняет изменение в SQLite и обновляет уведомления.
 * Компоненты работают только через этот стор, а не с БД и уведомлениями напрямую.
 */
export const useTasks = create<TasksState>()((set, get) => ({
  tasks: [],
  ready: false,

  init: async () => {
    if (get().ready) {
      return;
    }

    set({ tasks: await repository.getAllTasks() });
    await get().cleanupCompleted();
    set({ ready: true });
  },

  reload: async () => {
    if (get().ready) {
      set({ tasks: await repository.getAllTasks() });
    }
  },

  cleanupCompleted: async (now = new Date()) => {
    // ISO-строки в UTC сравниваются как строки так же, как моменты времени.
    const cutoff = startOfWeekMonday(now).toISOString();
    const isStale = (task: Task) => task.completedAt !== null && task.completedAt < cutoff;

    if (!get().tasks.some(isStale)) {
      return;
    }

    set((state) => ({ tasks: state.tasks.filter((task) => !isStale(task)) }));
    await repository.deleteCompletedBefore(cutoff);
  },

  addTask: async ({ title, remindAt }) => {
    const now = new Date().toISOString();
    const task: Task = {
      id: randomUUID(),
      title,
      remindAt,
      completedAt: null,
      notificationIds: [],
      createdAt: now,
      updatedAt: now,
    };

    set((state) => ({ tasks: [...state.tasks, task] }));
    await repository.saveTask(task);
    await get().syncNotifications(task.id);

    return task;
  },

  updateTask: async (id, patch) => {
    const current = get().tasks.find((task) => task.id === id);
    if (!current) {
      return;
    }

    const updated: Task = { ...current, ...patch, updatedAt: new Date().toISOString() };

    set((state) => ({ tasks: state.tasks.map((task) => (task.id === id ? updated : task)) }));
    await repository.saveTask(updated);

    if (NOTIFICATION_FIELDS.some((field) => field in patch)) {
      // Показанные уведомления неактуальны, если задача выполнена или её время изменилось.
      const dismiss = 'completedAt' in patch || patch.remindAt !== current.remindAt;
      await get().syncNotifications(id, { dismiss });
    }
  },

  toggleDone: async (id) => {
    const current = get().tasks.find((task) => task.id === id);
    if (current) {
      await get().setDone(id, !current.completedAt);
    }
  },

  setDone: async (id, done) => {
    const current = get().tasks.find((task) => task.id === id);
    if (!current || Boolean(current.completedAt) === done) {
      return;
    }

    await get().updateTask(id, { completedAt: done ? new Date().toISOString() : null });
  },

  snoozeTask: async (id, until) => {
    await get().updateTask(id, { remindAt: until.toISOString(), completedAt: null });
  },

  deleteTask: async (id) => {
    set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }));
    await repository.deleteTask(id);
    await safely(() => cancelTaskNotifications(id));
  },

  restoreTask: async (task) => {
    set((state) => ({ tasks: [...state.tasks.filter((t) => t.id !== task.id), task] }));
    await repository.saveTask(task);
    await get().syncNotifications(task.id);
  },

  rescheduleAll: async () => {
    for (const task of get().tasks) {
      await get().syncNotifications(task.id);
    }
  },

  syncNotifications: async (id, { dismiss = false } = {}) => {
    const task = get().tasks.find((item) => item.id === id);
    if (!task) {
      return;
    }

    const notificationIds = await safely(async () => {
      await cancelScheduledTaskNotifications(id);
      if (dismiss) {
        await dismissTaskNotifications(id);
      }
      return scheduleTaskNotifications(task);
    });
    if (!notificationIds) {
      return;
    }

    // id уведомлений — служебное поле: сохраняем без изменения updatedAt.
    const latest = get().tasks.find((item) => item.id === id);
    if (!latest) {
      return;
    }
    const withIds: Task = { ...latest, notificationIds };
    set((state) => ({ tasks: state.tasks.map((item) => (item.id === id ? withIds : item)) }));
    await repository.saveTask(withIds);
  },
}));

/**
 * Ошибка уведомлений не должна ломать работу с задачами: задача сохранится,
 * а уведомления восстановит синхронизация при следующем запуске.
 */
async function safely<T>(action: () => Promise<T>): Promise<T | null> {
  try {
    return await action();
  } catch (error) {
    console.warn('Notifications error', error);
    return null;
  }
}
