import { router } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutAnimation } from 'react-native';

import { useSnackbar } from '@/features/snackbar/store';

import { useTasks } from './store';
import type { Task } from './types';

/**
 * Действия с задачей из списков (вкладки «Задачи» и «Календарь»): открыть, отметить, удалить с отменой.
 * Изменения раскладки анимируются, удаление показывает снэкбар «Задача удалена · Отменить».
 */
export function useTaskActions() {
  const { t } = useTranslation();
  const toggleDone = useTasks((s) => s.toggleDone);
  const deleteTask = useTasks((s) => s.deleteTask);
  const restoreTask = useTasks((s) => s.restoreTask);
  const showSnackbar = useSnackbar((s) => s.show);

  const openTask = useCallback((task: Task) => {
    router.push({ pathname: '/task/[id]', params: { id: task.id } });
  }, []);

  const handleToggleDone = useCallback(
    (task: Task) => {
      // Следующее изменение раскладки (карточка уезжает в другую секцию) будет плавным.
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      toggleDone(task.id);
    },
    [toggleDone],
  );

  const handleDelete = useCallback(
    (task: Task) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      deleteTask(task.id);
      showSnackbar({
        message: t('tasks.deleted'),
        actionLabel: t('common.undo'),
        onAction: () => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          restoreTask(task);
        },
      });
    },
    [deleteTask, restoreTask, showSnackbar, t],
  );

  return { openTask, handleToggleDone, handleDelete };
}
