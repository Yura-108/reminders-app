import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { migrate } from './migrations';

const DATABASE_NAME = 'reminders.db';

let dbPromise: Promise<SQLiteDatabase> | null = null;

/**
 * Единственное подключение к БД. Открываем напрямую, а не через `SQLiteProvider`,
 * потому что к БД обращаются не только компоненты, но и стор и обработчики уведомлений.
 */
export function getDb(): Promise<SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openDatabaseAsync(DATABASE_NAME).then(async (db) => {
      await migrate(db);
      return db;
    });
  }

  return dbPromise;
}
