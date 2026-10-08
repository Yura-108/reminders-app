import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { memo, useRef, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import ReanimatedSwipeable, {
  SwipeDirection,
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { TaskCard } from '@/components/task-card';
import { Spacing } from '@/constants/theme';
import type { Task, TaskStatus } from '@/features/tasks/types';
import { useDelayedDone } from '@/features/tasks/use-delayed-done';
import { useTheme } from '@/hooks/use-theme';

/** На сколько нужно сдвинуть карточку, чтобы сработало действие. */
const THRESHOLD = 96;
const REMOVE_DURATION_MS = 250;

type Props = {
  task: Task;
  status: TaskStatus;
  whenLabel: string;
  onPress: (task: Task) => void;
  onToggleDone: (task: Task) => void;
  onDelete: (task: Task) => void;
};

/**
 * Карточка со свайпами (SPEC 3.1):
 * - вправо — выполнено (та же анимация, что у чекбокса) / вернуть в работу;
 * - влево — удалить: карточка остаётся сдвинутой на красном фоне и «схлопывается» по высоте.
 */
export const SwipeableTaskCard = memo(function SwipeableTaskCard({
  task,
  status,
  whenLabel,
  onPress,
  onToggleDone,
  onDelete,
}: Props) {
  const theme = useTheme();
  const swipeable = useRef<SwipeableMethods>(null);
  const { pendingDone, toggle } = useDelayedDone(task, status, onToggleDone);
  const done = status === 'done';
  // Иконки подложек создаём только во время свайпа: в покое их не видно, а карточек в списке много.
  const [swiping, setSwiping] = useState(false);

  // Высота строки и прогресс удаления (0 → 1) живут в UI-потоке Reanimated.
  const height = useSharedValue(0);
  const removing = useSharedValue(0);

  // .get()/.set() вместо .value и явный 'worklet' — так Reanimated корректно работает с React Compiler.
  const rowStyle = useAnimatedStyle(() => {
    'worklet';
    const progress = removing.get();
    if (progress === 0) {
      return {};
    }
    return { height: height.get() * (1 - progress), opacity: 1 - progress };
  });

  const handleLayout = (event: LayoutChangeEvent) => {
    if (removing.get() === 0) {
      height.set(event.nativeEvent.layout.height);
    }
  };

  const remove = () => {
    removing.set(
      withTiming(
        1,
        { duration: REMOVE_DURATION_MS, easing: Easing.out(Easing.quad) },
        (finished) => {
          if (finished) {
            scheduleOnRN(onDelete, task);
          }
        },
      ),
    );
  };

  return (
    <Animated.View style={[styles.row, rowStyle]} onLayout={handleLayout}>
      <ReanimatedSwipeable
        ref={swipeable}
        friction={1.5}
        leftThreshold={THRESHOLD}
        rightThreshold={THRESHOLD}
        overshootFriction={8}
        onSwipeableOpenStartDrag={() => setSwiping(true)}
        onSwipeableClose={() => setSwiping(false)}
        renderLeftActions={() => (
          <SwipeAction
            side="left"
            color={done ? theme.primary : theme.success}
            icon={
              swiping
                ? done
                  ? { ios: 'arrow.uturn.backward', android: 'undo', web: 'undo' }
                  : { ios: 'checkmark', android: 'check', web: 'check' }
                : null
            }
          />
        )}
        renderRightActions={() => (
          <SwipeAction
            side="right"
            color={theme.danger}
            icon={swiping ? { ios: 'trash', android: 'delete', web: 'delete' } : null}
          />
        )}
        // RIGHT — карточку утянули вправо (открылись левые действия).
        onSwipeableOpen={(direction) => {
          if (direction === SwipeDirection.RIGHT) {
            // Возвращаем карточку на место и ставим галочку — как при тапе по чекбоксу.
            swipeable.current?.close();
            toggle();
          } else {
            remove();
          }
        }}>
        <TaskCard
          task={task}
          status={status}
          whenLabel={whenLabel}
          pendingDone={pendingDone}
          onPress={onPress}
          onCheckboxPress={toggle}
        />
      </ReanimatedSwipeable>
    </Animated.View>
  );
});

function SwipeAction({
  side,
  color,
  icon,
}: {
  side: 'left' | 'right';
  color: string;
  icon: SymbolViewProps['name'] | null;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.action,
        { backgroundColor: color },
        side === 'left' ? styles.actionLeft : styles.actionRight,
      ]}>
      {icon ? <SymbolView name={icon} tintColor={theme.onPrimary} size={26} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    overflow: 'hidden',
  },
  action: {
    width: THRESHOLD,
    justifyContent: 'center',
    borderRadius: 14,
  },
  actionLeft: {
    alignItems: 'flex-start',
    paddingLeft: Spacing.four,
    marginRight: -14,
  },
  actionRight: {
    alignItems: 'flex-end',
    paddingRight: Spacing.four,
    marginLeft: -14,
  },
});
