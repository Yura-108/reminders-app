import { router, Tabs, usePathname } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, type ColorValue } from 'react-native';

import { TabBarAddButton } from '@/components/tab-bar-add-button';
import { countBirthdaysToday } from '@/features/birthdays/selectors';
import { useBirthdays } from '@/features/birthdays/store';
import { useCalendarSelection } from '@/features/calendar/store';
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
  const birthdaysToday = useBirthdays((s) => countBirthdaysToday(s.birthdays, now));
  const pathname = usePathname();
  const calendarDay = useCalendarSelection((s) => s.selectedDay);

  const onBirthdays = pathname === '/birthdays';

  // На вкладке дней рождения «+» создаёт день рождения (SPEC 12.2),
  // на вкладке календаря — задачу на выбранный в нём день (SPEC 3.3).
  const openNewTask = () => {
    if (onBirthdays) {
      router.push('/birthday/new');
    } else if (pathname === '/calendar') {
      router.push({ pathname: '/task/new', params: { date: calendarDay } });
    } else {
      router.push('/task/new');
    }
  };

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
          tabBarButton: () => (
            <TabBarAddButton
              color={onBirthdays ? theme.birthday : theme.primary}
              accessibilityLabel={onBirthdays ? t('birthday.addA11y') : t('task.addA11y')}
              onPress={openNewTask}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="birthdays"
        options={{
          title: t('tabs.birthdays'),
          // Сегодня у кого-то день рождения — розовый бейдж с количеством.
          tabBarBadge: birthdaysToday > 0 ? birthdaysToday : undefined,
          // По умолчанию бейдж 18×18 с цифрой 13 — делаем компактнее.
          tabBarBadgeStyle: {
            backgroundColor: theme.birthday,
            minWidth: 14,
            height: 14,
            borderRadius: 7,
            fontSize: 10,
            lineHeight: 13,
            paddingHorizontal: 3,
          },
          tabBarIcon: tabIcon({ ios: 'gift', android: 'cake', web: 'cake' }),
          // Импорт дней рождения из контактов (SPEC 12.4).
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/birthday/import')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('birthdayImport.action')}
              style={{ marginRight: 16 }}>
              <SymbolView
                name={{ ios: 'person.crop.circle.badge.plus', android: 'person_add', web: 'person_add' }}
                tintColor={theme.primary}
                size={24}
              />
            </Pressable>
          ),
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
