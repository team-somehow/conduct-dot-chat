import { useEffect, useCallback } from 'react';

export const useKeyToggle = (key: string, callback: () => void) => {
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key.toLowerCase() === key.toLowerCase()) {
      callback();
    }
  }, [key, callback]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);
};

export const useBrutalThemeToggle = () => {
  const toggleBrutalTheme = useCallback(() => {
    document.documentElement.classList.toggle('invert');
  }, []);

  useKeyToggle('b', toggleBrutalTheme);

  return toggleBrutalTheme;
}; 