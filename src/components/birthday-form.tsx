import { router, Stack, useNavigation } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { usePreventRemove } from 'expo-router/react-navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { FieldButton, HeaderCloseButton, HeaderSaveButton } from '@/components/ui/form-controls';
import { SettingsRow } from '@/components/ui/settings-group';
import { Spacing } from '@/constants/theme';
import { pickContact } from '@/features/birthdays/contacts';
import { useBirthdays } from '@/features/birthdays/store';
import {
  DEFAULT_REMIND_DAYS,
  DEFAULT_REMIND_MINUTES,
  NAME_MAX_LENGTH,
  REMIND_DAY_OPTIONS,
  type Birthday,
  type BirthdayInput,
} from '@/features/birthdays/types';
import { useWeekStart } from '@/features/settings/use-week-start';
import { useDateFormat } from '@/hooks/use-date-format';
import { useTheme } from '@/hooks/use-theme';
import { atTime } from '@/utils/date';
import { pickDate, pickTime } from '@/utils/pickers';

type Props = {
  /** Редактируемый день рождения; без него — создание нового. */
  birthday?: Birthday;
};

/** Год-заглушка для диалога выбора даты, когда год рождения неизвестен (високосный — чтобы было 29 февраля). */
const PLACEHOLDER_YEAR = 2000;

type FormValues = {
  name: string;
  /** Дата рождения (год может быть «заглушкой», если yearKnown = false) */
  date: Date | null;
  yearKnown: boolean;
  remindMinutes: number;
  remindDays: number[];
  /** Контакт, из которого взяты данные (защита от дублей при импорте). */
  contactId: string | null;
};

function initialValues(birthday?: Birthday): FormValues {
  if (!birthday) {
    return {
      name: '',
      date: null,
      yearKnown: true,
      remindMinutes: DEFAULT_REMIND_MINUTES,
      remindDays: DEFAULT_REMIND_DAYS,
      contactId: null,
    };
  }

  return {
    name: birthday.name,
    date: new Date(birthday.year ?? PLACEHOLDER_YEAR, birthday.month - 1, birthday.day),
    yearKnown: birthday.year !== null,
    remindMinutes: birthday.remindMinutes,
    remindDays: birthday.remindDays,
    contactId: birthday.contactId,
  };
}

function sameValues(a: FormValues, b: FormValues) {
  return (
    a.name === b.name &&
    a.date?.getTime() === b.date?.getTime() &&
    a.yearKnown === b.yearKnown &&
    a.remindMinutes === b.remindMinutes &&
    [...a.remindDays].sort().join() === [...b.remindDays].sort().join()
  );
}

/**
 * Форма создания/редактирования дня рождения (SPEC 12.3). Как и форма задачи, сама управляет
 * шапкой модалки, сохранением и подтверждением при закрытии с несохранёнными изменениями.
 */
export function BirthdayForm({ birthday }: Props) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();
  const weekStart = useWeekStart();
  const { formatTime, uses24hourClock } = useDateFormat();
  const addBirthday = useBirthdays((s) => s.addBirthday);
  const updateBirthday = useBirthdays((s) => s.updateBirthday);
  const deleteBirthday = useBirthdays((s) => s.deleteBirthday);

  const isNew = !birthday;
  const [initial] = useState(() => initialValues(birthday));
  const [values, setValues] = useState(initial);
  const [closing, setClosing] = useState(false);
  // Подсказка, если в выбранном контакте нет дня рождения.
  const [contactHasNoBirthday, setContactHasNoBirthday] = useState(false);
  const update = (patch: Partial<FormValues>) => setValues((current) => ({ ...current, ...patch }));

  const trimmedName = values.name.trim();
  const dirty = !sameValues(values, initial);
  const canSave = trimmedName.length > 0 && values.date !== null && (isNew || dirty);

  useEffect(() => {
    if (closing) {
      router.back();
    }
  }, [closing]);

  usePreventRemove(dirty && !closing, ({ data }) => {
    Alert.alert(t('task.discardTitle'), t('task.discardMessage'), [
      { text: t('task.keepEditing'), style: 'cancel' },
      {
        text: t('task.discard'),
        style: 'destructive',
        onPress: () => navigation.dispatch(data.action),
      },
    ]);
  });

  const save = () => {
    if (!canSave || !values.date) {
      return;
    }

    const input: BirthdayInput = {
      name: trimmedName,
      day: values.date.getDate(),
      month: values.date.getMonth() + 1,
      year: values.yearKnown ? values.date.getFullYear() : null,
      remindMinutes: values.remindMinutes,
      remindDays: [...values.remindDays].sort((a, b) => a - b),
      contactId: values.contactId,
    };

    if (birthday) {
      updateBirthday(birthday.id, input);
    } else {
      addBirthday(input);
    }
    setClosing(true);
  };

  const handlePickContact = async () => {
    const contact = await pickContact();
    if (!contact) {
      return;
    }

    const { birthday: date } = contact;
    update({
      name: contact.name || values.name,
      contactId: contact.contactId,
      ...(date && {
        date: new Date(date.year ?? PLACEHOLDER_YEAR, date.month - 1, date.day),
        yearKnown: date.year !== null,
      }),
    });
    setContactHasNoBirthday(!date);
  };

  const handlePickDate = async () => {
    const today = new Date();
    const date = await pickDate({
      value: values.date ?? new Date(PLACEHOLDER_YEAR, today.getMonth(), today.getDate()),
      maximumDate: today,
      firstDayOfWeek: weekStart,
    });
    if (date) {
      update({ date });
    }
  };

  const remindTime = atTime(new Date(), Math.floor(values.remindMinutes / 60), values.remindMinutes % 60);

  const handlePickTime = async () => {
    const time = await pickTime({ value: remindTime, is24Hour: uses24hourClock });
    if (time) {
      update({ remindMinutes: time.getHours() * 60 + time.getMinutes() });
    }
  };

  const toggleRemindDay = (days: number) => {
    update({
      remindDays: values.remindDays.includes(days)
        ? values.remindDays.filter((item) => item !== days)
        : [...values.remindDays, days],
    });
  };

  const handleDelete = () => {
    if (!birthday) return;
    Alert.alert(t('birthday.deleteConfirmTitle'), t('task.deleteConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          deleteBirthday(birthday.id);
          setClosing(true);
        },
      },
    ]);
  };

  const dateLabel = values.date
    ? new Intl.DateTimeFormat(i18n.language, {
        day: 'numeric',
        month: 'long',
        year: values.yearKnown ? 'numeric' : undefined,
      }).format(values.date)
    : t('birthday.datePlaceholder');

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => <HeaderCloseButton onPress={() => router.back()} />,
          headerRight: () => <HeaderSaveButton enabled={canSave} onPress={save} />,
        }}
      />

      <KeyboardAvoidingView behavior="padding" style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={[styles.inputCard, { backgroundColor: theme.card }]}>
            <TextInput
              value={values.name}
              onChangeText={(name) => update({ name })}
              placeholder={t('birthday.namePlaceholder')}
              placeholderTextColor={theme.textSecondary}
              autoFocus={isNew}
              maxLength={NAME_MAX_LENGTH}
              autoCapitalize="words"
              style={[styles.input, { color: theme.text }]}
            />
            <Pressable
              onPress={handlePickContact}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('birthday.pickContact')}>
              <SymbolView
                name={{ ios: 'person.crop.circle', android: 'contacts', web: 'contacts' }}
                tintColor={theme.primary}
                size={26}
              />
            </Pressable>
          </View>
          {contactHasNoBirthday ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
              {t('birthday.contactNoBirthday')}
            </ThemedText>
          ) : null}

          <View style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
              {t('birthday.dateLabel')}
            </ThemedText>
            <View style={styles.row}>
              <FieldButton
                icon={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }}
                label={dateLabel}
                muted={!values.date}
                onPress={handlePickDate}
              />
            </View>
            <View style={[styles.switchCard, { backgroundColor: theme.card }]}>
              <SettingsRow
                label={t('birthday.yearKnown')}
                onPress={() => update({ yearKnown: !values.yearKnown })}
                accessibilityRole="switch"
                accessibilityState={{ checked: values.yearKnown }}
                right={
                  <Switch
                    value={values.yearKnown}
                    onValueChange={(yearKnown) => update({ yearKnown })}
                    trackColor={{ true: theme.primary, false: theme.backgroundSelected }}
                    thumbColor={theme.onPrimary}
                  />
                }
              />
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
              {t('birthday.remindLabel')}
            </ThemedText>
            <View style={styles.row}>
              <FieldButton
                icon={{ ios: 'clock', android: 'schedule', web: 'schedule' }}
                label={formatTime(remindTime)}
                onPress={handlePickTime}
              />
            </View>
            <View style={styles.chips}>
              {REMIND_DAY_OPTIONS.map((days) => (
                <Chip
                  key={days}
                  label={t(`birthday.remindDays.d${days}`)}
                  selected={values.remindDays.includes(days)}
                  onPress={() => toggleRemindDay(days)}
                />
              ))}
            </View>
            {values.remindDays.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                {t('birthday.noReminders')}
              </ThemedText>
            ) : null}
          </View>

          {birthday ? (
            <Button
              label={t('birthday.delete')}
              icon={{ ios: 'trash', android: 'delete', web: 'delete' }}
              variant="danger"
              onPress={handleDelete}
            />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.four,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
  },
  input: {
    flex: 1,
    minHeight: 52,
    fontSize: 18,
    padding: 0,
  },
  section: {
    gap: Spacing.two,
  },
  hint: {
    marginTop: -Spacing.three,
    paddingHorizontal: Spacing.one,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.one,
  },
  row: {
    flexDirection: 'row',
  },
  switchCard: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
});
