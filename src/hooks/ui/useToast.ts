import { useState, useCallback } from 'react';

export function useToast(duration = 4500) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), duration);
  }, [duration]);

  const dismissToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  return { toastMessage, showToast, dismissToast };
}
