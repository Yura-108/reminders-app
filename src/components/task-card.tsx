import { SymbolView } from 'expo-symbols';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Checkbox } from '@/components/ui/checkbox';
import { Spacing } from '@/constants/theme';
import type { Task, TaskStatus } from '@/features/tasks/types';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  task: Task;
  status: TaskStatus;
  /** Готовая подпись времени: «19:30», «завтра, 9:00»… */
  whenLabel: string;
  /** Галочка уже стоит, но задача ещё не уехала в «Выполненные» (см. useDelayedDone). */
  pendingDone: boolean;
  onPress: (task: Task) => void;
  onCheckboxPress: () => void;
};

/**
 * Карточка задачи в списке: чекбокс, текст (до 2 строк) и время.
 * Горящая — красная полоска слева и огонёк; выполненная — зачёркнута и приглушена.
 */
export const TaskCard = memo(function TaskCard({
  task,
  status,
  whenLabel,
  pendingDone,
  onPress,
  onCheckboxPress,
}: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const done = status === 'done' || pendingDone;
  const burning = status === 'burning' && !pendingDone;

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
        onPress={onCheckboxPress}
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
