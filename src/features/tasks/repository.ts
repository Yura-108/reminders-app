import { getDb } from '@/db/client';

import type { Task } from './types';

/** Строка таблицы `tasks` как она лежит в SQLite. */
type TaskRow = {
  id: string;
  title: string;
  remind_at: string;
  completed_at: string | null;
  notification_ids: string;
  created_at: string;
  updated_at: string;
};

function fromRow(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    remindAt: row.remind_at,
    completedAt: row.completed_at,
    notificationIds: JSON.parse(row.notification_ids) as string[],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllTasks(): Promise<Task[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<TaskRow>('SELECT * FROM tasks ORDER BY remind_at');

  return rows.map(fromRow);
}

/** Вставка или полная перезапись задачи. */
export async function saveTask(task: Task): Promise<void> {
  const db = await getDb();

  await db.runAsync(
    `INSERT OR REPLACE INTO tasks
       (id, title, remind_at, completed_at, notification_ids, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    task.id,
    task.title,
    task.remindAt,
    task.completedAt,
    JSON.stringify(task.notificationIds),
    task.createdAt,
    task.updatedAt,
  );
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDb();

  await db.runAsync('DELETE FROM tasks WHERE id = ?', id);
}

/** Удаляет выполненные задачи, отмеченные раньше `before` (ISO). Возвращает число удалённых. */
export async function deleteCompletedBefore(before: string): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'DELETE FROM tasks WHERE completed_at IS NOT NULL AND completed_at < ?',
    before,
  );

  return result.changes;
}
