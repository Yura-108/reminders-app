import { randomUUID } from 'expo-crypto';
import { create } from 'zustand';

import { startOfWeekMonday } from '@/utils/date';

import * as repository from './repository';
import type { NewTask, Task, TaskPatch } from './types';

type TasksState = {
  tasks: Task[];
  /** true, когда задачи загружены из БД */
  ready: boolean;
  init: () => Promise<void>;
  addTask: (input: NewTask) => Promise<Task>;
  updateTask: (id: string, patch: TaskPatch) => Promise<void>;
  toggleDone: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  /** Вернуть удалённую задачу как была (кнопка «Отменить» в снэкбаре). */
  restoreTask: (task: Task) => Promise<void>;
  /**
   * Еженедельная очистка (SPEC 5.4): удаляет задачи, выполненные до последней полуночи
   * с воскресенья на понедельник. Безопасно вызывать сколько угодно раз.
   */
  cleanupCompleted: (now?: Date) => Promise<void>;
};

/**
 * Задачи в памяти + действия над ними. Каждое действие сначала обновляет состояние
 * (UI реагирует мгновенно), затем сохраняет изменение в SQLite.
 * Компоненты работают только через этот стор, а не с БД напрямую.
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
  },

  toggleDone: async (id) => {
    const current = get().tasks.find((task) => task.id === id);
    if (!current) {
      return;
    }

    await get().updateTask(id, {
      completedAt: current.completedAt ? null : new Date().toISOString(),
    });
  },

  deleteTask: async (id) => {
    set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }));
    await repository.deleteTask(id);
  },

  restoreTask: async (task) => {
    set((state) => ({ tasks: [...state.tasks.filter((t) => t.id !== task.id), task] }));
    await repository.saveTask(task);
  },
}));
