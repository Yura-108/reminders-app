import { useTranslation } from 'react-i18next';

import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function TasksScreen() {
  const { t } = useTranslation();

  return <PlaceholderScreen title={t('tabs.tasks')} hint={t('tasks.placeholder')} />;
}
