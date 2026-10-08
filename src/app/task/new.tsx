import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { TaskForm } from '@/components/task-form';
import { atTime, nextFullHour, parseDayParam } from '@/utils/date';

/**
 * Время по умолчанию: ближайший целый час. Если передан день (`?date=YYYY-MM-DD`, из календаря) —
 * этот день в 9:00, а если 9:00 этого дня уже прошло — ближайший целый час.
 */
function getDefaultRemindAt(dateParam: string | undefined): Date {
  const now = new Date();
  const day = parseDayParam(dateParam);
  const candidate = day ? atTime(day, 9) : nextFullHour(now);

  return candidate.getTime() > now.getTime() ? candidate : nextFullHour(now);
}

export default function NewTaskScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const [initialRemindAt] = useState(() => getDefaultRemindAt(date));

  return <TaskForm initialRemindAt={initialRemindAt} />;
}
