import { useTranslation } from 'react-i18next';

import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function NewTaskScreen() {
  const { t } = useTranslation();

  return <PlaceholderScreen title={t('task.newTitle')} hint={t('task.newPlaceholder')} />;
}
