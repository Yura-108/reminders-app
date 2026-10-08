import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';

const SIZE = 24;

type Props = {
  checked: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
};

/**
 * Круглый чекбокс. При отметке галочка «выпрыгивает» (scale 0 → 1.25 → 1).
 * Анимация на Reanimated выполняется в UI-потоке и не тормозит JS.
 */
export function Checkbox({ checked, onPress, accessibilityLabel }: Props) {
  const theme = useTheme();
  const scale = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    scale.value = checked
      ? withSequence(withTiming(1.25, { duration: 140 }), withSpring(1, { damping: 12 }))
      : withTiming(0, { duration: 120 });
  }, [checked, scale]);

  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: Math.min(scale.value, 1),
  }));

  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      style={[styles.box, { borderColor: checked ? theme.success : theme.textSecondary }]}>
      <Animated.View style={[styles.fill, { backgroundColor: theme.success }, fillStyle]}>
        <SymbolView
          name={{ ios: 'checkmark', android: 'check', web: 'check' }}
          tintColor={theme.onPrimary}
          size={16}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    // Перекрываем рамку, чтобы заливка была ровным кругом.
    top: -2,
    left: -2,
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
