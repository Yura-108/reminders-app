import { useTranslation } from 'react-i18next';

import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function BirthdaysScreen() {
  const { t } = useTranslation();

  return <PlaceholderScreen title={t('tabs.birthdays')} hint={t('birthdays.placeholder')} />;
}
