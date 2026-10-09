import { randomUUID } from 'expo-crypto';
import { create } from 'zustand';

import { cancelBirthdayNotifications, scheduleBirthdayNotifications } from './notifications';
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
  /** Пересоздать уведомления дня рождения по его текущим данным (SPEC 12.5). */
  syncNotifications: (id: string) => Promise<void>;
  /** Перепланировать уведомления всех дней рождения (смена языка или вибрации). */
  rescheduleAll: () => Promise<void>;
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
    await get().syncNotifications(birthday.id);

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
    await get().syncNotifications(id);
  },

  deleteBirthday: async (id) => {
    set((state) => ({ birthdays: state.birthdays.filter((item) => item.id !== id) }));
    await repository.deleteBirthday(id);
    await safely(() => cancelBirthdayNotifications(id));
  },

  restoreBirthday: async (birthday) => {
    set((state) => ({
      birthdays: [...state.birthdays.filter((item) => item.id !== birthday.id), birthday],
    }));
    await repository.saveBirthday(birthday);
    await get().syncNotifications(birthday.id);
  },

  syncNotifications: async (id) => {
    const birthday = get().birthdays.find((item) => item.id === id);
    if (!birthday) {
      return;
    }

    const notificationIds = await safely(async () => {
      await cancelBirthdayNotifications(id);
      return scheduleBirthdayNotifications(birthday);
    });
    if (!notificationIds) {
      return;
    }

    // id уведомлений — служебное поле: сохраняем без изменения updatedAt.
    const latest = get().birthdays.find((item) => item.id === id);
    if (!latest) {
      return;
    }
    const withIds: Birthday = { ...latest, notificationIds };
    set((state) => ({
      birthdays: state.birthdays.map((item) => (item.id === id ? withIds : item)),
    }));
    await repository.saveBirthday(withIds);
  },

  rescheduleAll: async () => {
    for (const birthday of get().birthdays) {
      await get().syncNotifications(birthday.id);
    }
  },
}));

/** Ошибка уведомлений не должна ломать работу с днями рождения — их восстановит сверка при запуске. */
async function safely<T>(action: () => Promise<T>): Promise<T | null> {
  try {
    return await action();
  } catch (error) {
    console.warn('Birthday notifications error', error);
    return null;
  }
}
