import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

type PickOptions = {
  value: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  is24Hour?: boolean;
  /** Первый день недели в календаре диалога: 0 — воскресенье, 1 — понедельник… */
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
};

/**
 * Системные диалоги выбора даты и времени Android.
 * Возвращают выбранное значение или null, если пользователь закрыл диалог.
 * (Для iOS позже понадобится другая реализация — диалогов там нет, только встроенный пикер.)
 */
export function pickDate({
  value,
  minimumDate,
  maximumDate,
  firstDayOfWeek,
}: PickOptions): Promise<Date | null> {
  return new Promise((resolve) => {
    DateTimePickerAndroid.open({
      value,
      mode: 'date',
      minimumDate,
      maximumDate,
      firstDayOfWeek,
      onValueChange: (_event, date) => resolve(date),
      onDismiss: () => resolve(null),
    });
  });
}

export function pickTime({ value, is24Hour }: PickOptions): Promise<Date | null> {
  return new Promise((resolve) => {
    DateTimePickerAndroid.open({
      value,
      mode: 'time',
      is24Hour,
      onValueChange: (_event, date) => resolve(date),
      onDismiss: () => resolve(null),
    });
  });
}
