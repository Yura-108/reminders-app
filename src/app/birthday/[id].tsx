import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BirthdayForm } from '@/components/birthday-form';
import { EmptyState } from '@/components/empty-state';
import { useBirthdays } from '@/features/birthdays/store';

export default function EditBirthdayScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const birthday = useBirthdays((s) => s.birthdays.find((item) => item.id === id));
  // Запоминаем: после удаления из стора форма ещё доживает до закрытия модалки.
  const [snapshot] = useState(birthday);
  const current = birthday ?? snapshot;

  if (!current) {
    return (
      <EmptyState
        icon={{ ios: 'questionmark.circle', android: 'help', web: 'help' }}
        title={t('task.notFound')}
        hint={t('task.notFoundHint')}
      />
    );
  }

  return <BirthdayForm birthday={current} />;
}
