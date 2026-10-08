import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <PlaceholderScreen title="Редактирование" hint={`Задача ${id}`} />;
}
