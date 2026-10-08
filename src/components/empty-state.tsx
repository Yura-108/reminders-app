import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  icon: SymbolViewProps['name'];
  title: string;
  hint?: string;
  children?: ReactNode;
};

export function EmptyState({ icon, title, hint, children }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <SymbolView name={icon} tintColor={theme.textSecondary} size={56} />
      <ThemedText type="smallBold" style={styles.title}>
        {title}
      </ThemedText>
      {hint ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
          {hint}
        </ThemedText>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
  },
  title: {
    fontSize: 18,
    marginTop: Spacing.two,
  },
  hint: {
    textAlign: 'center',
  },
});
