import { createContext, useState, useMemo, useEffect } from "react";

export interface ColorMode {
  mode: 'light' | 'dark';
  toggleColorMode: () => void;
  clearStoredMode: () => void;
}

export const ColorModeContext = createContext<ColorMode>({
  mode: 'light',
  toggleColorMode: () => {},
  clearStoredMode: () => {},
});

export function useColorMode() {
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [mode, setMode] = useState<'light' | 'dark'>(
    localStorage.getItem('theme') !== null 
      ? localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
      : prefersDarkMode ? 'dark' : 'light'
  );
  
  // Update document attribute whenever mode changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);
  
  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference
      if (localStorage.getItem('theme') === null) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          
          // if (process.env.NODE_ENV === 'development') {
          console.log(`Switching to ${newMode} mode`);
          location.reload();
          // }
          
          localStorage.setItem('theme', newMode);
          return newMode;
        });
      },
      clearStoredMode: () => {
        localStorage.removeItem('theme');
        const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setMode(systemPreference);
      },
    }),
    [mode]
  );

  return colorMode;
}