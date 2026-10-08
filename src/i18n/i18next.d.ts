import 'i18next';

import type en from './en';

// Типизация ключей: t('tabs.tasks') проверяется TypeScript-ом, опечатка — ошибка компиляции.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof en;
    };
  }
}
