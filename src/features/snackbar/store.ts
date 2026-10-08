import { create } from 'zustand';

const DEFAULT_DURATION_MS = 4000;

type SnackbarOptions = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
};

type SnackbarState = {
  current: (SnackbarOptions & { id: number }) | null;
  show: (options: SnackbarOptions) => void;
  hide: () => void;
};

let hideTimer: ReturnType<typeof setTimeout> | undefined;
let nextId = 1;

/**
 * Одно всплывающее сообщение внизу экрана. Новое сообщение заменяет предыдущее.
 * Вызывается откуда угодно: `useSnackbar.getState().show({...})`.
 */
export const useSnackbar = create<SnackbarState>()((set) => ({
  current: null,

  show: (options) => {
    clearTimeout(hideTimer);
    set({ current: { ...options, id: nextId++ } });
    hideTimer = setTimeout(() => set({ current: null }), options.durationMs ?? DEFAULT_DURATION_MS);
  },

  hide: () => {
    clearTimeout(hideTimer);
    set({ current: null });
  },
}));
