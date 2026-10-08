import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { Duration } from '@/utils/date';

/**
 * Текущее время, которое обновляется в начале каждой минуты и при возврате приложения
 * на передний план. Нужно, чтобы задачи становились «горящими» без перезапуска.
 */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const tick = () => {
      const current = new Date();
      setNow(current);
      // Следующий тик — ровно в начале следующей минуты.
      timeout = setTimeout(tick, Duration.MINUTE - (current.getTime() % Duration.MINUTE));
    };

    timeout = setTimeout(tick, Duration.MINUTE - (Date.now() % Duration.MINUTE));

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        clearTimeout(timeout);
        tick();
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.remove();
    };
  }, []);

  return now;
}
