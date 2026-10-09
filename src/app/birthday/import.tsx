import { router, Stack } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { HeaderCloseButton, HeaderSaveButton } from '@/components/ui/form-controls';
import { Spacing } from '@/constants/theme';
import { getContactsWithBirthdays, type ContactWithBirthday } from '@/features/birthdays/contacts';
import { useBirthdays } from '@/features/birthdays/store';
import {
  DEFAULT_REMIND_DAYS,
  DEFAULT_REMIND_MINUTES,
  type Birthday,
} from '@/features/birthdays/types';
import { useSnackbar } from '@/features/snackbar/store';
import { useTheme } from '@/hooks/use-theme';

type LoadState =
  | { status: 'loading' }
  | { status: 'denied' }
  | { status: 'ready'; contacts: ContactWithBirthday[] };

/** Уже есть в списке: тот же контакт или то же имя с той же датой (SPEC 12.4). */
function isAlreadyAdded(contact: ContactWithBirthday, birthdays: Birthday[]) {
  const name = contact.name.toLowerCase();
  return birthdays.some(
    (birthday) =>
      birthday.contactId === contact.contactId ||
      (birthday.name.trim().toLowerCase() === name &&
        birthday.day === contact.birthday?.day &&
        birthday.month === contact.birthday?.month),
  );
}

/**
 * Импорт дней рождения из контактов (SPEC 12.4): все контакты с указанным ДР,
 * пользователь отмечает нужных и добавляет разом. Уже добавленные не дублируются.
 */
export default function BirthdayImportScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const birthdays = useBirthdays((s) => s.birthdays);
  const addBirthday = useBirthdays((s) => s.addBirthday);
  const showSnackbar = useSnackbar((s) => s.show);
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // Увеличивается по кнопке «Попробовать снова» — перезапускает загрузку.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Экран могут закрыть до окончания загрузки — тогда результат игнорируем.
    let active = true;
    getContactsWithBirthdays().then((result) => {
      if (active) {
        setState(result ? { status: 'ready', contacts: result } : { status: 'denied' });
      }
    });
    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = () => {
    setState({ status: 'loading' });
    setAttempt((count) => count + 1);
  };

  const contacts = useMemo(() => (state.status === 'ready' ? state.contacts : []), [state]);
  // Список «можно добавить» фиксируем по дням рождения на момент открытия экрана.
  const [initialBirthdays] = useState(birthdays);
  const available = useMemo(
    () => contacts.filter((contact) => !isAlreadyAdded(contact, initialBirthdays)),
    [contacts, initialBirthdays],
  );
  const allSelected = available.length > 0 && selected.size === available.length;

  const dateFormat = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'long' }),
    [i18n.language],
  );

  const toggle = (contactId: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(contactId)) {
        next.delete(contactId);
      } else {
        next.add(contactId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(available.map((contact) => contact.contactId)));
  };

  const importSelected = () => {
    const chosen = available.filter((contact) => selected.has(contact.contactId));
    for (const contact of chosen) {
      if (!contact.birthday) continue;
      addBirthday({
        name: contact.name,
        day: contact.birthday.day,
        month: contact.birthday.month,
        year: contact.birthday.year,
        remindMinutes: DEFAULT_REMIND_MINUTES,
        remindDays: DEFAULT_REMIND_DAYS,
        contactId: contact.contactId,
      });
    }
    router.back();
    showSnackbar({ message: t('birthdayImport.added', { count: chosen.length }) });
  };

  const formatBirthday = (contact: ContactWithBirthday) => {
    const date = contact.birthday;
    if (!date) return '';
    // Год-заглушка 2000 (високосный) — чтобы 29 февраля форматировалось корректно.
    const label = dateFormat.format(new Date(2000, date.month - 1, date.day));
    return date.year ? `${label} ${date.year}` : label;
  };

  const renderItem = ({ item }: { item: ContactWithBirthday }) => {
    const added = isAlreadyAdded(item, initialBirthdays);
    const checked = selected.has(item.contactId);

    return (
      <Pressable
        onPress={() => toggle(item.contactId)}
        disabled={added}
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled: added }}
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: pressed ? theme.backgroundSelected : theme.card },
          added && styles.rowDisabled,
        ]}>
        <View style={styles.rowText}>
          <ThemedText numberOfLines={1}>{item.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {added ? `${formatBirthday(item)} · ${t('birthdayImport.alreadyAdded')}` : formatBirthday(item)}
          </ThemedText>
        </View>
        {added ? null : <Checkbox checked={checked} onPress={() => toggle(item.contactId)} />}
      </Pressable>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => <HeaderCloseButton onPress={() => router.back()} />,
          headerRight: () => (
            <HeaderSaveButton
              enabled={selected.size > 0}
              label={t('birthdayImport.add', { count: selected.size })}
              onPress={importSelected}
            />
          ),
        }}
      />

      {state.status === 'loading' ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : state.status === 'denied' ? (
        <EmptyState
          icon={{ ios: 'person.crop.circle.badge.xmark', android: 'contacts', web: 'contacts' }}
          title={t('birthdayImport.noAccess')}
          hint={t('contacts.deniedMessage')}>
          <View style={styles.retry}>
            <Button label={t('birthdayImport.retry')} onPress={retry} />
          </View>
        </EmptyState>
      ) : contacts.length === 0 ? (
        <EmptyState
          icon={{ ios: 'gift', android: 'cake', web: 'cake' }}
          title={t('birthdayImport.emptyTitle')}
          hint={t('birthdayImport.emptyHint')}
        />
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(contact) => contact.contactId}
          renderItem={renderItem}
          ItemSeparatorComponent={Separator}
          contentContainerStyle={styles.content}
          ListHeaderComponent={
            available.length > 0 ? (
              <Pressable
                onPress={toggleAll}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: allSelected }}
                style={styles.selectAll}>
                <ThemedText type="smallBold" style={{ color: theme.primary }}>
                  {t('birthdayImport.selectAll')}
                </ThemedText>
                <Checkbox checked={allSelected} onPress={toggleAll} />
              </Pressable>
            ) : null
          }
        />
      )}
    </>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
  },
  selectAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: 14,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  rowText: {
    flex: 1,
    gap: Spacing.half,
  },
  retry: {
    alignSelf: 'stretch',
    marginTop: Spacing.three,
  },
  separator: {
    height: Spacing.two,
  },
});
