import { useEffect } from 'react';

import { useNow } from '@/hooks/use-now';
import { startOfWeekMonday } from '@/utils/date';

import { useTasks } from './store';

/**
 * Запускает очистку выполненных задач, когда наступает новая неделя (полночь на понедельник),
 * а также при возврате в приложение (useNow обновляется на переднем плане).
 * Ничего не рендерит; вынесен в отдельный компонент, чтобы ежеминутный тик useNow
 * не перерисовывал корневой layout.
 */
export function WeeklyCleanup() {
  const weekStart = startOfWeekMonday(useNow()).getTime();

  useEffect(() => {
    useTasks.getState().cleanupCompleted();
  }, [weekStart]);

  return null;
}
