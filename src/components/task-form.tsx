import { router, Stack, useNavigation } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { FieldButton, HeaderCloseButton, HeaderSaveButton } from '@/components/ui/form-controls';
import { Spacing } from '@/constants/theme';
import { useNotificationPermission } from '@/features/notifications/permissions';
import { useWeekStart } from '@/features/settings/use-week-start';
import { getTaskStatus } from '@/features/tasks/selectors';
import { useTasks } from '@/features/tasks/store';
import type { Task } from '@/features/tasks/types';
import { useDateFormat } from '@/hooks/use-date-format';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import {
  addDays,
  atTime,
  Duration,
  startOfDay,
  startOfMinute,
  withDatePart,
  withTimePart,
} from '@/utils/date';
import { pickDate, pickTime } from '@/utils/pickers';

export const TITLE_MAX_LENGTH = 500;

type Props = {
  /** Редактируемая задача; без неё — создание новой. */
  task?: Task;
  /** Время напоминания по умолчанию для новой задачи. */
  initialRemindAt: Date;
};

/**
 * Форма создания/редактирования задачи (SPEC 3.2). Сама управляет шапкой модалки,
 * сохранением в стор и подтверждением при закрытии с несохранёнными изменениями.
 */
export function TaskForm({ task, initialRemindAt }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const now = useNow();
  const navigation = useNavigation();
  const { formatDate, formatTime, uses24hourClock } = useDateFormat();
  const weekStart = useWeekStart();
  const addTask = useTasks((s) => s.addTask);
  const updateTask = useTasks((s) => s.updateTask);
  const deleteTask = useTasks((s) => s.deleteTask);
  const toggleDone = useTasks((s) => s.toggleDone);

  const isNew = !task;
  const initialTitle = task?.title ?? '';
  const [initialDate] = useState(() => (task ? new Date(task.remindAt) : initialRemindAt));
  const [title, setTitle] = useState(initialTitle);
  const [remindAt, setRemindAt] = useState(initialDate);
  // Форма закрывается сама (после сохранения/удаления) — подтверждение не нужно.
  const [closing, setClosing] = useState(false);

  const trimmedTitle = title.trim();
  const timeChanged = remindAt.getTime() !== initialDate.getTime();
  const dirty = title !== initialTitle || timeChanged;
  // У горящей задачи можно поправить текст, не трогая время; новое время — только в будущем.
  const isPast = (isNew || timeChanged) && remindAt.getTime() <= now.getTime();
  const canSave = trimmedTitle.length > 0 && !isPast && (isNew || dirty);

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
    if (!canSave) {
      return;
    }

    // Разрешение спрашиваем при первом сохранении, когда понятно, зачем оно (SPEC 4.4).
    useNotificationPermission.getState().ensure();

    const values = { title: trimmedTitle, remindAt: remindAt.toISOString() };
    if (task) {
      updateTask(task.id, values);
    } else {
      addTask(values);
    }
    setClosing(true);
  };

  const handlePickDate = async () => {
    const date = await pickDate({
      value: remindAt,
      minimumDate: isNew ? startOfDay(now) : undefined,
      firstDayOfWeek: weekStart,
    });
    if (date) {
      setRemindAt(withDatePart(remindAt, date));
    }
  };

  const handlePickTime = async () => {
    const time = await pickTime({ value: remindAt, is24Hour: uses24hourClock });
    if (time) {
      setRemindAt(withTimePart(remindAt, time));
    }
  };

  const handleToggleDone = () => {
    if (!task) return;
    toggleDone(task.id);
    setClosing(true);
  };

  const handleSnooze = () => {
    if (!task) return;
    // Меню переноса заменяет окно задачи, а не открывается поверх него.
    router.replace({ pathname: '/task/snooze/[id]', params: { id: task.id } });
  };

  const handleDelete = () => {
    if (!task) return;
    Alert.alert(t('task.deleteConfirmTitle'), t('task.deleteConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          deleteTask(task.id);
          setClosing(true);
        },
      },
    ]);
  };

  const quickOptions = buildQuickOptions(now).map((option) => ({
    ...option,
    label:
      option.kind === 'inHour'
        ? t('task.chips.inHour')
        : t(`task.chips.${option.kind}`, { time: formatTime(option.value) }),
  }));

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
              value={title}
              onChangeText={setTitle}
              placeholder={t('task.titlePlaceholder')}
              placeholderTextColor={theme.textSecondary}
              autoFocus={isNew}
              multiline
              maxLength={TITLE_MAX_LENGTH}
              style={[styles.input, { color: theme.text }]}
            />
            <ThemedText type="small" themeColor="textSecondary" style={styles.counter}>
              {title.length}/{TITLE_MAX_LENGTH}
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
              {t('task.remindAt')}
            </ThemedText>

            <View style={styles.row}>
              <FieldButton
                icon={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }}
                label={formatDate(remindAt)}
                error={isPast}
                onPress={handlePickDate}
              />
              <FieldButton
                icon={{ ios: 'clock', android: 'schedule', web: 'schedule' }}
                label={formatTime(remindAt)}
                error={isPast}
                onPress={handlePickTime}
              />
            </View>

            {isPast ? (
              <ThemedText type="small" style={{ color: theme.danger }}>
                {t('task.pastError')}
              </ThemedText>
            ) : null}

            <View style={styles.chips}>
              {quickOptions.map((option) => (
                <Chip
                  key={option.key}
                  label={option.label}
                  selected={option.value.getTime() === remindAt.getTime()}
                  onPress={() => setRemindAt(option.value)}
                />
              ))}
            </View>
          </View>

          {task ? (
            <View style={styles.actions}>
              {getTaskStatus(task, now) === 'burning' ? (
                <Button
                  label={t('task.snooze')}
                  icon={{ ios: 'clock.arrow.circlepath', android: 'snooze', web: 'snooze' }}
                  onPress={handleSnooze}
                />
              ) : null}
              <Button
                label={task.completedAt ? t('task.markUndone') : t('task.markDone')}
                icon={
                  task.completedAt
                    ? { ios: 'arrow.uturn.backward', android: 'undo', web: 'undo' }
                    : { ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' }
                }
                variant={task.completedAt ? 'default' : 'success'}
                onPress={handleToggleDone}
              />
              <Button
                label={t('task.delete')}
                icon={{ ios: 'trash', android: 'delete', web: 'delete' }}
                variant="danger"
                onPress={handleDelete}
              />
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

type QuickOption = { key: string; kind: 'inHour' | 'today' | 'tomorrow'; value: Date };

/** Быстрые варианты «сегодня/завтра в ЧЧ:00». Варианты на сегодня скрываются, когда время прошло. */
const TODAY_HOURS = [14, 18];
const TOMORROW_HOURS = [8, 13];

function buildQuickOptions(now: Date): QuickOption[] {
  const options: QuickOption[] = [
    {
      key: 'in-hour',
      kind: 'inHour',
      value: startOfMinute(new Date(now.getTime() + Duration.HOUR)),
    },
  ];

  for (const hour of TODAY_HOURS) {
    const value = atTime(now, hour);
    if (value.getTime() > now.getTime()) {
      options.push({ key: `today-${hour}`, kind: 'today', value });
    }
  }

  const tomorrow = addDays(now, 1);
  for (const hour of TOMORROW_HOURS) {
    options.push({ key: `tomorrow-${hour}`, kind: 'tomorrow', value: atTime(tomorrow, hour) });
  }

  return options;
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
    borderRadius: 14,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  input: {
    minHeight: 96,
    fontSize: 18,
    lineHeight: 24,
    textAlignVertical: 'top',
    padding: 0,
  },
  counter: {
    alignSelf: 'flex-end',
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
  actions: {
    gap: Spacing.two,
  },
});
