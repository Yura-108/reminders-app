export type Task = {
  id: string;
  /** Текст задачи, 1..500 символов */
  title: string;
  /** Время напоминания, ISO 8601 в UTC */
  remindAt: string;
  /** Когда отмечена выполненной; null — не выполнена */
  completedAt: string | null;
  /** id запланированных уведомлений (этап 5) */
  notificationIds: string[];
  createdAt: string;
  updatedAt: string;
};

/**
 * Статус вычисляется из данных и текущего времени, в БД не хранится.
 * - done — выполнена
 * - burning — время прошло, не выполнена («горящая»)
 * - upcoming — время ещё не наступило
 */
export type TaskStatus = 'done' | 'burning' | 'upcoming';

export type NewTask = Pick<Task, 'title' | 'remindAt'>;

export type TaskPatch = Partial<Pick<Task, 'title' | 'remindAt' | 'completedAt' | 'notificationIds'>>;
