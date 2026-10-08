import { useEffect, useRef, useState } from 'react';

import type { Task, TaskStatus } from './types';

/** Сколько задача остаётся на месте с галочкой, прежде чем уехать в «Выполненные». */
const DONE_DELAY_MS = 700;

/**
 * Отметка «выполнено» с паузой: галочка ставится сразу, а сама задача меняется через DONE_DELAY_MS,
 * чтобы пользователь увидел результат. Используется и чекбоксом, и свайпом.
 *
 * - `pendingDone` — галочка уже стоит, задача ещё на месте;
 * - `toggle()` — отметить с паузой / снять отметку сразу / отменить, если пауза ещё идёт.
 */
export function useDelayedDone(
  task: Task,
  status: TaskStatus,
  onToggleDone: (task: Task) => void,
) {
  const [pendingDone, setPendingDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commit = useRef<(() => void) | null>(null);

  // Если карточка исчезла во время паузы (например, сменила секцию), отметку не теряем — применяем сразу.
  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
        commit.current?.();
      }
    },
    [],
  );

  const toggle = () => {
    if (status === 'done') {
      onToggleDone(task);
      return;
    }

    if (pendingDone) {
      // Повторное действие во время паузы — передумал.
      clearTimeout(timer.current ?? undefined);
      timer.current = null;
      setPendingDone(false);
      return;
    }

    commit.current = () => onToggleDone(task);
    setPendingDone(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      setPendingDone(false);
      onToggleDone(task);
    }, DONE_DELAY_MS);
  };

  return { pendingDone, toggle };
}
