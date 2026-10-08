import { randomUUID } from 'expo-crypto';
import { create } from 'zustand';

import { Duration } from '@/utils/date';

import * as repository from './repository';
import type { NewTask, Task, TaskPatch } from './types';

/** Сколько хранить выполненные задачи (SPEC 5.4). */
const KEEP_COMPLETED_DAYS = 30;

type TasksState = {
  tasks: Task[];
  /** true, когда задачи загружены из БД */
  ready: boolean;
  init: () => Promise<void>;
  addTask: (input: NewTask) => Promise<Task>;
  updateTask: (id: string, patch: TaskPatch) => Promise<void>;
  toggleDone: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
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

    const cutoff = new Date(Date.now() - KEEP_COMPLETED_DAYS * Duration.DAY).toISOString();
    await repository.deleteCompletedBefore(cutoff);

    set({ tasks: await repository.getAllTasks(), ready: true });
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
}));
