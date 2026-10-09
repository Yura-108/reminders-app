import { randomUUID } from 'expo-crypto';
import { create } from 'zustand';

import * as repository from './repository';
import type { Birthday, BirthdayInput } from './types';

type BirthdaysState = {
  birthdays: Birthday[];
  ready: boolean;
  init: () => Promise<void>;
  addBirthday: (input: BirthdayInput) => Promise<Birthday>;
  updateBirthday: (id: string, input: Partial<BirthdayInput>) => Promise<void>;
  deleteBirthday: (id: string) => Promise<void>;
  /** Вернуть удалённый день рождения как был (кнопка «Отменить» в снэкбаре). */
  restoreBirthday: (birthday: Birthday) => Promise<void>;
};

/**
 * Дни рождения в памяти + действия над ними. Как и у задач: сначала обновляем состояние
 * (UI реагирует мгновенно), затем сохраняем в SQLite.
 */
export const useBirthdays = create<BirthdaysState>()((set, get) => ({
  birthdays: [],
  ready: false,

  init: async () => {
    if (get().ready) {
      return;
    }
    set({ birthdays: await repository.getAllBirthdays(), ready: true });
  },

  addBirthday: async (input) => {
    const now = new Date().toISOString();
    const birthday: Birthday = {
      ...input,
      id: randomUUID(),
      notificationIds: [],
      createdAt: now,
      updatedAt: now,
    };

    set((state) => ({ birthdays: [...state.birthdays, birthday] }));
    await repository.saveBirthday(birthday);

    return birthday;
  },

  updateBirthday: async (id, input) => {
    const current = get().birthdays.find((item) => item.id === id);
    if (!current) {
      return;
    }

    const updated: Birthday = { ...current, ...input, updatedAt: new Date().toISOString() };
    set((state) => ({
      birthdays: state.birthdays.map((item) => (item.id === id ? updated : item)),
    }));
    await repository.saveBirthday(updated);
  },

  deleteBirthday: async (id) => {
    set((state) => ({ birthdays: state.birthdays.filter((item) => item.id !== id) }));
    await repository.deleteBirthday(id);
  },

  restoreBirthday: async (birthday) => {
    set((state) => ({
      birthdays: [...state.birthdays.filter((item) => item.id !== birthday.id), birthday],
    }));
    await repository.saveBirthday(birthday);
  },
}));
