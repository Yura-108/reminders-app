import { create } from 'zustand';

import { toDayKey } from '@/utils/date';

type CalendarState = {
  /** Выбранный день 'YYYY-MM-DD'. Кнопка «+» на вкладке календаря создаёт задачу на этот день. */
  selectedDay: string;
  selectDay: (day: string) => void;
};

export const useCalendarSelection = create<CalendarState>()((set) => ({
  selectedDay: toDayKey(new Date()),
  selectDay: (selectedDay) => set({ selectedDay }),
}));
