import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

const SIZE = 56;

type Props = {
  onPress: () => void;
};

/**
 * Центральная кнопка «+» в таббаре. Не переключает таб, а открывает модалку создания задачи.
 */
export function TabBarAddButton({ onPress }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.slot}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Добавить задачу"
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 },
        ]}>
        <SymbolView
          name={{ ios: 'plus', android: 'add', web: 'add' }}
          tintColor={theme.onPrimary}
          size={30}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    flex: 1,
    alignItems: 'center',
  },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    // Приподнимаем кнопку над таббаром.
    marginTop: -SIZE / 3,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
