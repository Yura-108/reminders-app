import { router, Tabs } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import type { ColorValue } from 'react-native';

import { TabBarAddButton } from '@/components/tab-bar-add-button';
import { countBurning } from '@/features/tasks/selectors';
import { useTasks } from '@/features/tasks/store';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';

type IconName = SymbolViewProps['name'];

function tabIcon(name: IconName) {
  return function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <SymbolView name={name} tintColor={color} size={size} />;
  };
}

export default function TabLayout() {
  const theme = useTheme();
  const { t } = useTranslation();
  const now = useNow();
  const burningCount = useTasks((s) => countBurning(s.tasks, now));

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.tasks'),
          tabBarBadge: burningCount > 0 ? burningCount : undefined,
          tabBarIcon: tabIcon({ ios: 'checklist', android: 'checklist', web: 'checklist' }),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t('tabs.calendar'),
          tabBarIcon: tabIcon({ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: t('tabs.add'),
          tabBarButton: () => <TabBarAddButton onPress={() => router.push('/task/new')} />,
        }}
      />
      <Tabs.Screen
        name="birthdays"
        options={{
          title: t('tabs.birthdays'),
          tabBarIcon: tabIcon({ ios: 'gift', android: 'cake', web: 'cake' }),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: tabIcon({ ios: 'gearshape', android: 'settings', web: 'settings' }),
        }}
      />
    </Tabs>
  );
}
