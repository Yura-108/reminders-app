import { getDb } from '@/db/client';

import type { Birthday } from './types';

/** Строка таблицы `birthdays` как она лежит в SQLite. */
type BirthdayRow = {
  id: string;
  name: string;
  day: number;
  month: number;
  year: number | null;
  remind_minutes: number;
  remind_days: string;
  contact_id: string | null;
  notification_ids: string;
  created_at: string;
  updated_at: string;
};

function fromRow(row: BirthdayRow): Birthday {
  return {
    id: row.id,
    name: row.name,
    day: row.day,
    month: row.month,
    year: row.year,
    remindMinutes: row.remind_minutes,
    remindDays: JSON.parse(row.remind_days) as number[],
    contactId: row.contact_id,
    notificationIds: JSON.parse(row.notification_ids) as string[],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllBirthdays(): Promise<Birthday[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<BirthdayRow>('SELECT * FROM birthdays');

  return rows.map(fromRow);
}

/** Вставка или полная перезапись. */
export async function saveBirthday(birthday: Birthday): Promise<void> {
  const db = await getDb();

  await db.runAsync(
    `INSERT OR REPLACE INTO birthdays
       (id, name, day, month, year, remind_minutes, remind_days, contact_id,
        notification_ids, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    birthday.id,
    birthday.name,
    birthday.day,
    birthday.month,
    birthday.year,
    birthday.remindMinutes,
    JSON.stringify(birthday.remindDays),
    birthday.contactId,
    JSON.stringify(birthday.notificationIds),
    birthday.createdAt,
    birthday.updatedAt,
  );
}

export async function deleteBirthday(id: string): Promise<void> {
  const db = await getDb();

  await db.runAsync('DELETE FROM birthdays WHERE id = ?', id);
}
