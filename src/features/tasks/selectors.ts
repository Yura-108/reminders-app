import { calendarDayDiff, toDayKey } from '@/utils/date';

import type { Task, TaskStatus } from './types';

export function getTaskStatus(task: Task, now: Date): TaskStatus {
  if (task.completedAt) {
    return 'done';
  }

  return new Date(task.remindAt).getTime() <= now.getTime() ? 'burning' : 'upcoming';
}

export type TaskSectionKey = 'burning' | 'today' | 'tomorrow' | 'later' | 'done';

export type TaskSection = {
  key: TaskSectionKey;
  data: Task[];
};

const byRemindAt = (a: Task, b: Task) => a.remindAt.localeCompare(b.remindAt);
const byCompletedAtDesc = (a: Task, b: Task) =>
  (b.completedAt ?? '').localeCompare(a.completedAt ?? '');

/**
 * Раскладывает задачи по секциям списка (см. SPEC 3.1). Пустые секции не возвращаются.
 * ISO-строки в UTC сравниваются как строки так же, как даты.
 */
export function buildTaskSections(tasks: Task[], now: Date): TaskSection[] {
  const groups: Record<TaskSectionKey, Task[]> = {
    burning: [],
    today: [],
    tomorrow: [],
    later: [],
    done: [],
  };

  for (const task of tasks) {
    const status = getTaskStatus(task, now);

    if (status === 'done') {
      groups.done.push(task);
    } else if (status === 'burning') {
      groups.burning.push(task);
    } else {
      const dayDiff = calendarDayDiff(new Date(task.remindAt), now);
      if (dayDiff === 0) groups.today.push(task);
      else if (dayDiff === 1) groups.tomorrow.push(task);
      else groups.later.push(task);
    }
  }

  groups.burning.sort(byRemindAt);
  groups.today.sort(byRemindAt);
  groups.tomorrow.sort(byRemindAt);
  groups.later.sort(byRemindAt);
  groups.done.sort(byCompletedAtDesc);

  const order: TaskSectionKey[] = ['burning', 'today', 'tomorrow', 'later', 'done'];

  return order
    .filter((key) => groups[key].length > 0)
    .map((key) => ({ key, data: groups[key] }));
}

export function countBurning(tasks: Task[], now: Date): number {
  return tasks.filter((task) => getTaskStatus(task, now) === 'burning').length;
}

export type DayMarker = 'burning' | 'active' | 'done';

/**
 * Отметки для календаря (SPEC 3.3): по дню — самое «важное» состояние его задач.
 * burning — есть горящие, active — есть невыполненные, done — только выполненные.
 */
export function buildDayMarkers(tasks: Task[], now: Date): Map<string, DayMarker> {
  const priority: Record<DayMarker, number> = { done: 0, active: 1, burning: 2 };
  const markers = new Map<string, DayMarker>();

  for (const task of tasks) {
    const status = getTaskStatus(task, now);
    const marker: DayMarker =
      status === 'burning' ? 'burning' : status === 'done' ? 'done' : 'active';
    const day = toDayKey(new Date(task.remindAt));
    const current = markers.get(day);

    if (!current || priority[marker] > priority[current]) {
      markers.set(day, marker);
    }
  }

  return markers;
}

/** Задачи дня: сначала невыполненные по времени, затем выполненные. */
export function tasksForDay(tasks: Task[], day: string): Task[] {
  return tasks
    .filter((task) => toDayKey(new Date(task.remindAt)) === day)
    .sort((a, b) => {
      const doneDiff = Number(Boolean(a.completedAt)) - Number(Boolean(b.completedAt));
      return doneDiff !== 0 ? doneDiff : byRemindAt(a, b);
    });
}
