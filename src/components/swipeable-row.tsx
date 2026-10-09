import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useRef, useState, type ReactNode } from 'react';
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

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** На сколько нужно сдвинуть карточку, чтобы сработало действие. */
const THRESHOLD = 96;
const REMOVE_DURATION_MS = 250;

type RightSwipeAction = {
  color: string;
  icon: SymbolViewProps['name'];
  onTrigger: () => void;
};

type Props = {
  children: ReactNode;
  /** Свайп вправо (необязательно): карточка возвращается на место и вызывается onTrigger. */
  swipeRight?: RightSwipeAction;
  /** Свайп влево — удалить: карточка остаётся на красном фоне, «схлопывается» и вызывается onDelete. */
  onDelete: () => void;
};

/**
 * Обёртка со свайпами для карточек списков (задачи, дни рождения).
 * Иконки подложек создаются только во время свайпа: в покое их не видно, а карточек в списке много.
 */
export function SwipeableRow({ children, swipeRight, onDelete }: Props) {
  const theme = useTheme();
  const swipeable = useRef<SwipeableMethods>(null);
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
            scheduleOnRN(onDelete);
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
        renderLeftActions={
          swipeRight
            ? () => (
                <SwipeAction
                  side="left"
                  color={swipeRight.color}
                  icon={swiping ? swipeRight.icon : null}
                />
              )
            : undefined
        }
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
            swipeable.current?.close();
            swipeRight?.onTrigger();
          } else {
            remove();
          }
        }}>
        {children}
      </ReanimatedSwipeable>
    </Animated.View>
  );
}

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
