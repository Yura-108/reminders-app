import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';

import { SettingsGroup, SettingsRow } from '@/components/ui/settings-group';
import { useTheme } from '@/hooks/use-theme';

export type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  title: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  footer?: string;
  /** Дополнительные строки в конце карточки (например, «Попробовать»). */
  children?: ReactNode;
};

/**
 * Группа настроек с выбором одного варианта (как radio-группа).
 */
export function OptionGroup<T extends string>({
  title,
  options,
  value,
  onChange,
  footer,
  children,
}: Props<T>) {
  const theme = useTheme();

  return (
    <SettingsGroup title={title} footer={footer}>
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <SettingsRow
            key={option.value}
            label={option.label}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            right={
              selected ? (
                <SymbolView
                  name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                  tintColor={theme.primary}
                  size={22}
                />
              ) : null
            }
          />
        );
      })}
      {children}
    </SettingsGroup>
  );
}
