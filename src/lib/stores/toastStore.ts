import { writable } from 'svelte/store';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration: number;
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);
  let nextId = 0;

  return {
    subscribe,
    add: (message: string, type: Toast['type'] = 'success', duration: number = 5000) => {
      const id = nextId++;
      const newToast: Toast = { id, message, type, duration };
      
      update(toasts => [newToast, ...toasts]);
      
      // Auto remove after duration
      setTimeout(() => {
        update(toasts => toasts.filter(t => t.id !== id));
      }, duration);
    },
    remove: (id: number) => {
      update(toasts => toasts.filter(t => t.id !== id));
    },
    clear: () => {
      update(() => []);
    }
  };
}

export const toastStore = createToastStore();

// Convenient function to export
export const addToast = toastStore.add;