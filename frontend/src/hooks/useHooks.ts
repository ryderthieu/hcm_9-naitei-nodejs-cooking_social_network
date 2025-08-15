import { useState, useEffect, useRef } from 'react';
import { showErrorAlert } from '../utils/utils';

// ==================== useDropdown Hook ====================
export function useDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  return {
    isOpen,
    dropdownRef,
    toggle,
    close,
    open
  };
}

// ==================== useAsyncOperation Hook ====================
export function useAsyncOperation<T = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      if (errorMessage) {
        showErrorAlert(error, errorMessage);
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    execute
  };
}
