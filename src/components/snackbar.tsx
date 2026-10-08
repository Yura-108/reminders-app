import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useSnackbar } from '@/features/snackbar/store';
import { useTheme } from '@/hooks/use-theme';

/**
 * Показывает текущее сообщение из `useSnackbar` внизу экрана.
 * Размещается последним элементом экрана (поверх содержимого).
 */
export function Snackbar() {
  const theme = useTheme();
  const current = useSnackbar((s) => s.current);
  const hide = useSnackbar((s) => s.hide);

  if (!current) {
    return null;
  }

  const handleAction = () => {
    current.onAction?.();
    hide();
  };

  return (
    <View pointerEvents="box-none" style={styles.container}>
      <Animated.View
        key={current.id}
        entering={FadeInDown.duration(200)}
        exiting={FadeOutDown.duration(200)}
        style={[styles.snackbar, { backgroundColor: theme.text }]}>
        <ThemedText style={[styles.message, { color: theme.background }]} numberOfLines={2}>
          {current.message}
        </ThemedText>
        {current.actionLabel ? (
          <Pressable onPress={handleAction} hitSlop={8} accessibilityRole="button">
            <ThemedText type="smallBold" style={[styles.action, { color: theme.primary }]}>
              {current.actionLabel}
            </ThemedText>
          </Pressable>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  snackbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  message: {
    flex: 1,
  },
  action: {
    textTransform: 'uppercase',
  },
});
