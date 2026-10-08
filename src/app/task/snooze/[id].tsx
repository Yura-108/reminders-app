import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function SnoozeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <PlaceholderScreen title="Перенести" hint={`Задача ${id}`} />;
}
