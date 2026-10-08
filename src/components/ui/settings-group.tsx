import { Children, Fragment, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type GroupProps = {
  title: string;
  /** Пояснение мелким текстом под карточкой. */
  footer?: string;
  children: ReactNode;
};

/** Группа настроек: заголовок капсом, карточка со строками (с разделителями), пояснение снизу. */
export function SettingsGroup({ title, footer, children }: GroupProps) {
  const theme = useTheme();
  const rows = Children.toArray(children).filter(Boolean);

  return (
    <View style={styles.group}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.title}>
        {title}
      </ThemedText>
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        {rows.map((row, index) => (
          <Fragment key={index}>
            {index > 0 ? <View style={[styles.divider, { backgroundColor: theme.border }]} /> : null}
            {row}
          </Fragment>
        ))}
      </View>
      {footer ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
          {footer}
        </ThemedText>
      ) : null}
    </View>
  );
}

type RowProps = {
  label: string;
  /** Второстепенный текст под подписью. */
  description?: string;
  /** Что показать справа: значение, переключатель, галочку… */
  right?: ReactNode;
  onPress?: () => void;
  accessibilityRole?: 'button' | 'radio' | 'switch';
  accessibilityState?: { checked?: boolean; selected?: boolean };
};

/** Строка настройки. Если передан onPress — нажимается и подсвечивается. */
export function SettingsRow({
  label,
  description,
  right,
  onPress,
  accessibilityRole,
  accessibilityState,
}: RowProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={accessibilityRole ?? (onPress ? 'button' : undefined)}
      accessibilityState={accessibilityState}
      style={({ pressed }) => [
        styles.row,
        pressed && onPress ? { backgroundColor: theme.backgroundSelected } : null,
      ]}>
      <View style={styles.texts}>
        <ThemedText>{label}</ThemedText>
        {description ? (
          <ThemedText type="small" themeColor="textSecondary">
            {description}
          </ThemedText>
        ) : null}
      </View>
      {right}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: Spacing.two,
  },
  title: {
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.three,
  },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.three,
  },
  footer: {
    paddingHorizontal: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 52,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  texts: {
    flex: 1,
    gap: Spacing.half,
  },
});
