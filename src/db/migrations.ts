import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Шаги миграции схемы. Индекс шага + 1 = версия БД после его выполнения.
 * Уже выпущенные шаги НЕ редактируем — только добавляем новые в конец.
 */
const MIGRATIONS: string[] = [
  // v1: задачи
  `
  CREATE TABLE tasks (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    remind_at TEXT NOT NULL,
    completed_at TEXT,
    notification_ids TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX idx_tasks_remind_at ON tasks(remind_at);
  `,
];

/**
 * Доводит схему БД до последней версии. Текущая версия хранится в `PRAGMA user_version`.
 */
export async function migrate(db: SQLiteDatabase) {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion >= MIGRATIONS.length) {
    return;
  }

  await db.execAsync('PRAGMA journal_mode = WAL');

  for (let version = currentVersion; version < MIGRATIONS.length; version++) {
    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.execAsync(MIGRATIONS[version]);
      await txn.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
  }
}
