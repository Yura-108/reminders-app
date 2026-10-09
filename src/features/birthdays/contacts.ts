import { Contact, ContactField, requestPermissionsAsync, type ContactDate } from 'expo-contacts';
import { Alert, Linking, Platform } from 'react-native';

import i18n from '@/i18n';

/** Контакт в том виде, который нужен дням рождения. */
export type ContactWithBirthday = {
  contactId: string;
  name: string;
  /** null — в контакте не указан день рождения */
  birthday: { day: number; month: number; year: number | null } | null;
};

/** Поля контакта, которые мы читаем: на iOS — `birthday`, на Android — список `dates`. */
type RawDetails = {
  id: string;
  fullName?: string | null;
  birthday?: ContactDate | null;
  dates?: { label?: string; date?: ContactDate }[];
};

// День рождения на iOS лежит в отдельном поле, а на Android — среди дат контакта с меткой «birthday».
const FIELDS =
  Platform.OS === 'ios'
    ? [ContactField.FULL_NAME, ContactField.BIRTHDAY]
    : [ContactField.FULL_NAME, ContactField.DATES];

function normalize(details: RawDetails): ContactWithBirthday {
  const date = details.birthday ?? details.dates?.find((item) => item.label === 'birthday')?.date;
  const valid = date && date.day >= 1 && date.day <= 31 && date.month >= 1 && date.month <= 12;

  return {
    contactId: details.id,
    name: (details.fullName ?? '').trim(),
    birthday: valid ? { day: date.day, month: date.month, year: date.year ?? null } : null,
  };
}

/**
 * Запрашивает доступ к контактам. Если пользователь запретил его насовсем — объясняет,
 * где включить, и предлагает открыть настройки приложения.
 */
export async function ensureContactsPermission(): Promise<boolean> {
  const { granted, canAskAgain } = await requestPermissionsAsync();
  if (granted) {
    return true;
  }

  if (!canAskAgain) {
    Alert.alert(i18n.t('contacts.deniedTitle'), i18n.t('contacts.deniedMessage'), [
      { text: i18n.t('common.cancel'), style: 'cancel' },
      { text: i18n.t('settings.permissionOpenSettings'), onPress: () => Linking.openSettings() },
    ]);
  }
  return false;
}

/** Системный выбор одного контакта (SPEC 12.3). null — нет доступа или пользователь закрыл выбор. */
export async function pickContact(): Promise<ContactWithBirthday | null> {
  if (!(await ensureContactsPermission())) {
    return null;
  }

  const contact = await Contact.presentPicker();
  if (!contact) {
    return null;
  }

  const details = (await contact.getDetails(FIELDS)) as RawDetails;
  return normalize(details);
}

/** Все контакты с указанным днём рождения, по алфавиту (SPEC 12.4). null — нет доступа. */
export async function getContactsWithBirthdays(): Promise<ContactWithBirthday[] | null> {
  if (!(await ensureContactsPermission())) {
    return null;
  }

  const all = (await Contact.getAllDetails(FIELDS)) as RawDetails[];

  return all
    .map(normalize)
    .filter((contact) => contact.birthday !== null && contact.name.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}
