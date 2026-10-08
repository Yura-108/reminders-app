import { SymbolView } from 'expo-symbols';
import { memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Checkbox } from '@/components/ui/checkbox';
import { Spacing } from '@/constants/theme';
import type { Task, TaskStatus } from '@/features/tasks/types';
import { useTheme } from '@/hooks/use-theme';

/** Сколько задача остаётся на месте с галочкой, прежде чем уехать в «Выполненные». */
const DONE_DELAY_MS = 700;

type Props = {
  task: Task;
  status: TaskStatus;
  /** Готовая подпись времени: «19:30», «завтра, 9:00»… */
  whenLabel: string;
  onPress: (task: Task) => void;
  onToggleDone: (task: Task) => void;
};

/**
 * Карточка задачи в списке: чекбокс, текст (до 2 строк) и время.
 * Горящая — красная полоска слева и огонёк; выполненная — зачёркнута и приглушена.
 */
export const TaskCard = memo(function TaskCard({
  task,
  status,
  whenLabel,
  onPress,
  onToggleDone,
}: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  // «Почти выполнена»: галочка уже стоит, но задача ещё не уехала в «Выполненные».
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

  const done = status === 'done' || pendingDone;
  const burning = status === 'burning' && !pendingDone;

  const handleCheckboxPress = () => {
    if (status === 'done') {
      onToggleDone(task);
      return;
    }

    if (pendingDone) {
      // Повторный тап во время паузы — передумал.
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

  return (
    <Pressable
      onPress={() => onPress(task)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: pressed ? theme.backgroundSelected : theme.card },
      ]}>
      {burning ? <View style={[styles.burningBar, { backgroundColor: theme.danger }]} /> : null}

      <Checkbox
        checked={done}
        onPress={handleCheckboxPress}
        accessibilityLabel={done ? t('tasks.markUndone') : t('tasks.markDone')}
      />

      <View style={styles.body}>
        <ThemedText
          numberOfLines={2}
          themeColor={done ? 'textSecondary' : 'text'}
          style={done && styles.doneTitle}>
          {task.title}
        </ThemedText>
        <ThemedText type="small" style={{ color: burning ? theme.danger : theme.textSecondary }}>
          {whenLabel}
        </ThemedText>
      </View>

      {burning ? (
        <SymbolView
          name={{ ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' }}
          tintColor={theme.danger}
          size={22}
        />
      ) : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: 14,
    overflow: 'hidden',
  },
  burningBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  body: {
    flex: 1,
    gap: Spacing.half,
  },
  doneTitle: {
    textDecorationLine: 'line-through',
  },
});
