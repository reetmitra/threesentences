/**
 * Three™ - Toast Context
 *
 * Global toast notification provider and hook.
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Toast, ToastType } from '@/components/ui/Toast';

interface ToastState {
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((type: ToastType, message: string, duration?: number) => {
    // Clear any existing toast
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If already visible, quickly hide then show new one
    if (visible) {
      setVisible(false);
      timeoutRef.current = setTimeout(() => {
        setToast({ type, message, duration });
        setVisible(true);
      }, 350);
    } else {
      setToast({ type, message, duration });
      setVisible(true);
    }
  }, [visible]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          visible={visible}
          duration={toast.duration}
          onDismiss={handleDismiss}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
