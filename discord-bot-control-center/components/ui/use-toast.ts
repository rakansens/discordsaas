// Toast通知フック

import { useState, useCallback } from 'react';

type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  title?: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

interface Toast extends ToastOptions {
  id: string;
}

interface UseToastReturn {
  toasts: Toast[];
  toast: (options: ToastOptions) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

/**
 * Toast通知を表示するためのカスタムフック
 * 
 * @returns Toast関連の関数と状態
 */
export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      title: options.title || '',
      description: options.description || '',
      type: options.type || 'default',
      duration: options.duration || 5000,
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    // 指定した時間後に自動的に消える
    if (newToast.duration !== Infinity) {
      setTimeout(() => {
        dismiss(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    toast,
    dismiss,
    dismissAll,
  };
};
