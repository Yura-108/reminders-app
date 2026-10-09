import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Поле-кнопка формы (дата, время): иконка + значение; при ошибке — красная рамка. */
export function FieldButton({
  icon,
  label,
  error = false,
  muted = false,
  onPress,
}: {
  icon: SymbolViewProps['name'];
  label: string;
  error?: boolean;
  /** Значение ещё не выбрано — подпись-подсказка серым. */
  muted?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const textColor = error ? theme.danger : muted ? theme.textSecondary : theme.text;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.field,
        {
          backgroundColor: pressed ? theme.backgroundSelected : theme.card,
          borderColor: error ? theme.danger : 'transparent',
        },
      ]}>
      <SymbolView name={icon} tintColor={error ? theme.danger : theme.primary} size={22} />
      <ThemedText style={{ color: textColor }}>{label}</ThemedText>
    </Pressable>
  );
}

/** Кнопка ✕ в шапке модалки. */
export function HeaderCloseButton({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={t('common.close')}>
      <SymbolView
        name={{ ios: 'xmark', android: 'close', web: 'close' }}
        tintColor={theme.text}
        size={24}
      />
    </Pressable>
  );
}

/** Кнопка «Сохранить» (или другая подпись) в шапке модалки; неактивна — серая. */
export function HeaderSaveButton({
  enabled,
  label,
  onPress,
}: {
  enabled: boolean;
  label?: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={onPress}
      disabled={!enabled}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityState={{ disabled: !enabled }}>
      <ThemedText
        type="smallBold"
        style={[styles.saveLabel, { color: enabled ? theme.primary : theme.textSecondary }]}>
        {label ?? t('task.save')}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 52,
    paddingHorizontal: Spacing.three,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  saveLabel: {
    fontSize: 16,
  },
});
