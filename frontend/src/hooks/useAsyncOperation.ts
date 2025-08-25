import { useState } from 'react';
import { useAlertPopup } from './useAlertPopup';

export function useAsyncOperation<T = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { showError } = useAlertPopup();

  const execute = async (
    operation: () => Promise<T>,
    errorMessage?: string
  ): Promise<T | null> => {
    if (loading) return null;

    setLoading(true);
    setError(null);

    try {
      const result = await operation();
      return result;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      if (errorMessage) {
        showError(errorMessage);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    execute,
  };
}
