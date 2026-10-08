import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'default' | 'success' | 'danger';

type Props = {
  label: string;
  icon?: SymbolViewProps['name'];
  variant?: Variant;
  onPress: () => void;
};

/** Кнопка во всю ширину: иконка + подпись на фоне карточки. Цвет текста зависит от варианта. */
export function Button({ label, icon, variant = 'default', onPress }: Props) {
  const theme = useTheme();
  const color = { default: theme.text, success: theme.success, danger: theme.danger }[variant];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: pressed ? theme.backgroundSelected : theme.card },
      ]}>
      {icon ? <SymbolView name={icon} tintColor={color} size={22} /> : null}
      <ThemedText style={{ color }}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 52,
    paddingHorizontal: Spacing.three,
    borderRadius: 14,
  },
});
