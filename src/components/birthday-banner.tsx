import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { birthdaysOnDay } from '@/features/birthdays/selectors';
import { useBirthdays } from '@/features/birthdays/store';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  now: Date;
};

/**
 * Плашка над списком задач в день рождения (SPEC 12.6): «🎂 Сегодня день рождения: Аня».
 * Несколько — «Аня, Миша» или «Аня и ещё 2». Тап → вкладка «Дни рождения».
 */
export function BirthdayBanner({ now }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  // Берём из стора сам массив, а фильтруем здесь: селектор, возвращающий каждый раз
  // новый массив, в Zustand 5 вызывает бесконечные перерисовки.
  const birthdays = useBirthdays((s) => s.birthdays);
  const today = birthdaysOnDay(birthdays, now);

  if (today.length === 0) {
    return null;
  }

  // Имена без склонения: «у Ани» из «Аня» мы получить не можем.
  const names =
    today.length <= 2
      ? today.map((birthday) => birthday.name).join(', ')
      : t('birthdays.bannerMore', { name: today[0].name, count: today.length - 1 });

  return (
    <Pressable
      onPress={() => router.navigate('/birthdays')}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.banner,
        { backgroundColor: pressed ? theme.backgroundSelected : theme.card, borderColor: theme.birthday },
      ]}>
      <SymbolView
        name={{ ios: 'gift.fill', android: 'cake', web: 'cake' }}
        tintColor={theme.birthday}
        size={22}
      />
      <ThemedText type="small" style={styles.text} numberOfLines={2}>
        {t('birthdays.banner', { names })}
      </ThemedText>
      <SymbolView
        name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
        tintColor={theme.textSecondary}
        size={18}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginHorizontal: Spacing.three,
    marginTop: Spacing.three,
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
  },
  text: {
    flex: 1,
  },
});
