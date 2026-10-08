import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useNotificationPermission } from '@/features/notifications/permissions';
import { useTheme } from '@/hooks/use-theme';

/**
 * Плашка «Уведомления выключены» (SPEC 4.4). Видна, только если пользователь отказал в разрешении.
 * Кнопка открывает настройки приложения в системе — повторно спросить из приложения Android не даст.
 */
export function PermissionBanner() {
  const { t } = useTranslation();
  const theme = useTheme();
  const status = useNotificationPermission((s) => s.status);

  if (status !== 'denied') {
    return null;
  }

  return (
    <View style={[styles.banner, { backgroundColor: theme.card, borderColor: theme.danger }]}>
      <SymbolView
        name={{ ios: 'bell.slash', android: 'notifications_off', web: 'notifications_off' }}
        tintColor={theme.danger}
        size={22}
      />
      <ThemedText type="small" style={styles.text}>
        {t('notifications.permissionOff')}
      </ThemedText>
      <Pressable onPress={() => Linking.openSettings()} hitSlop={8} accessibilityRole="button">
        <ThemedText type="smallBold" style={{ color: theme.primary }}>
          {t('notifications.permissionAction')}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginHorizontal: Spacing.three,
    marginTop: Spacing.three,
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
  },
  text: {
    flex: 1,
  },
});
