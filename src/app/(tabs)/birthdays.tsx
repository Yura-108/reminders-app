import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutAnimation, SectionList, StyleSheet, View } from 'react-native';

import { BirthdayCard } from '@/components/birthday-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
import { Snackbar } from '@/components/snackbar';
import { SwipeableRow } from '@/components/swipeable-row';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { buildBirthdaySections, type BirthdaySection } from '@/features/birthdays/selectors';
import { useBirthdays } from '@/features/birthdays/store';
import type { Birthday } from '@/features/birthdays/types';
import { useBirthdayLabels } from '@/features/birthdays/use-birthday-labels';
import { useSnackbar } from '@/features/snackbar/store';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';

/** Вкладка «Дни рождения» (SPEC 12.1): сегодняшние сверху, дальше — по ближайшей дате. */
export default function BirthdaysScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const now = useNow();
  const birthdays = useBirthdays((s) => s.birthdays);
  const ready = useBirthdays((s) => s.ready);
  const deleteBirthday = useBirthdays((s) => s.deleteBirthday);
  const restoreBirthday = useBirthdays((s) => s.restoreBirthday);
  const showSnackbar = useSnackbar((s) => s.show);
  const labelsFor = useBirthdayLabels();

  const sections = useMemo(() => buildBirthdaySections(birthdays, now), [birthdays, now]);

  const openBirthday = useCallback((birthday: Birthday) => {
    router.push({ pathname: '/birthday/[id]', params: { id: birthday.id } });
  }, []);

  const handleDelete = useCallback(
    (birthday: Birthday) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      deleteBirthday(birthday.id);
      showSnackbar({
        message: t('birthdays.deleted'),
        actionLabel: t('common.undo'),
        onAction: () => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          restoreBirthday(birthday);
        },
      });
    },
    [deleteBirthday, restoreBirthday, showSnackbar, t],
  );

  const renderItem = useCallback(
    ({ item }: { item: Birthday }) => {
      const labels = labelsFor(item, now);
      const subtitle = [labels.date, labels.when, labels.age].filter(Boolean).join(' · ');

      return (
        <SwipeableRow onDelete={() => handleDelete(item)}>
          <BirthdayCard
            birthday={item}
            subtitle={subtitle}
            highlighted={labels.isToday}
            onPress={openBirthday}
          />
        </SwipeableRow>
      );
    },
    [labelsFor, now, handleDelete, openBirthday],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: BirthdaySection }) => (
      <ThemedText
        type="smallBold"
        style={[
          styles.sectionTitle,
          { color: section.key === 'today' ? theme.birthday : theme.textSecondary },
        ]}>
        {t(`birthdays.sections.${section.key}`)}
      </ThemedText>
    ),
    [t, theme],
  );

  if (!ready) {
    return null;
  }

  return (
    <View style={styles.screen}>
      {birthdays.length === 0 ? (
        <EmptyState
          icon={{ ios: 'gift', android: 'cake', web: 'cake' }}
          title={t('birthdays.emptyTitle')}
          hint={t('birthdays.emptyHint')}>
          <View style={styles.emptyAction}>
            <Button
              label={t('birthdayImport.action')}
              icon={{ ios: 'person.crop.circle.badge.plus', android: 'person_add', web: 'person_add' }}
              onPress={() => router.push('/birthday/import')}
            />
          </View>
        </EmptyState>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(birthday) => birthday.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          ItemSeparatorComponent={Separator}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.content}
        />
      )}
      <Snackbar />
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.one,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  emptyAction: {
    alignSelf: 'stretch',
    marginTop: Spacing.three,
  },
  separator: {
    height: Spacing.two,
  },
});
