import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function SnoozeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();

  return <PlaceholderScreen title={t('snooze.title')} hint={t('task.editPlaceholder', { id })} />;
}
