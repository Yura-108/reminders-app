import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

type PickOptions = {
  value: Date;
  minimumDate?: Date;
  is24Hour?: boolean;
};

/**
 * Системные диалоги выбора даты и времени Android.
 * Возвращают выбранное значение или null, если пользователь закрыл диалог.
 * (Для iOS позже понадобится другая реализация — диалогов там нет, только встроенный пикер.)
 */
export function pickDate({ value, minimumDate }: PickOptions): Promise<Date | null> {
  return new Promise((resolve) => {
    DateTimePickerAndroid.open({
      value,
      mode: 'date',
      minimumDate,
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
