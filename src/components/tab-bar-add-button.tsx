import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';

const SIZE = 56;
const COLOR_DURATION_MS = 250;

type Props = {
  /** Цвет кнопки: обычный акцент или розовый на вкладке дней рождения. Меняется плавно. */
  color: string;
  accessibilityLabel: string;
  onPress: () => void;
};

/**
 * Центральная кнопка «+» в таббаре. Не переключает таб, а открывает модалку создания.
 */
export function TabBarAddButton({ color, accessibilityLabel, onPress }: Props) {
  const theme = useTheme();
  const background = useSharedValue(color);

  useEffect(() => {
    background.set(withTiming(color, { duration: COLOR_DURATION_MS }));
  }, [color, background]);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return { backgroundColor: background.get() };
  });

  return (
    <View style={styles.slot}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [styles.pressable, { opacity: pressed ? 0.85 : 1 }]}>
        <Animated.View style={[styles.button, animatedStyle]}>
          <SymbolView
            name={{ ios: 'plus', android: 'add', web: 'add' }}
            tintColor={theme.onPrimary}
            size={30}
          />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    flex: 1,
    alignItems: 'center',
  },
  pressable: {
    // Приподнимаем кнопку над таббаром.
    marginTop: -SIZE / 3,
  },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
