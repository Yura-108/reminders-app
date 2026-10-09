import { SymbolView } from 'expo-symbols';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { Birthday } from '@/features/birthdays/types';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  birthday: Birthday;
  /** «14 окт. · через 6 дней · исполнится 25» */
  subtitle: string;
  /** Подсветить розовым (сегодняшний ДР, карточка в календаре). */
  highlighted: boolean;
  onPress: (birthday: Birthday) => void;
};

/** Карточка дня рождения. Подсвеченная — с розовой полоской и тортом. */
export const BirthdayCard = memo(function BirthdayCard({
  birthday,
  subtitle,
  highlighted,
  onPress,
}: Props) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={() => onPress(birthday)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: pressed ? theme.backgroundSelected : theme.card },
      ]}>
      {highlighted ? <View style={[styles.todayBar, { backgroundColor: theme.birthday }]} /> : null}

      <View style={styles.body}>
        <ThemedText numberOfLines={1} style={styles.name}>
          {birthday.name}
        </ThemedText>
        <ThemedText
          type="small"
          numberOfLines={1}
          style={{ color: highlighted ? theme.birthday : theme.textSecondary }}>
          {subtitle}
        </ThemedText>
      </View>

      {highlighted ? (
        <SymbolView
          name={{ ios: 'gift.fill', android: 'cake', web: 'cake' }}
          tintColor={theme.birthday}
          size={24}
        />
      ) : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: 14,
    overflow: 'hidden',
  },
  todayBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  body: {
    flex: 1,
    gap: Spacing.half,
  },
  name: {
    fontWeight: 600,
  },
});
