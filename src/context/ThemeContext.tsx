import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { updateFaviconForTheme } from '../utils/faviconManager';

export type ThemeMode = 'light' | 'dark';
export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  themePreference: ThemePreference;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  resetToSystem: () => void;
}

const THEME_STORAGE_KEY = 'aurelith_theme_preference';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getStoredPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // ignore
  }
  return 'system';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preference, setPreference] = useState<ThemePreference>(() => getStoredPreference());
  const [systemTheme, setSystemTheme] = useState<ThemeMode>(() => getSystemTheme());

  // Listen to OS color scheme changes when user hasn't chosen an explicit override
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Effective theme is explicit preference or system fallback
  const effectiveTheme: ThemeMode = preference === 'system' ? systemTheme : preference;

  // Sync DOM and Favicons with effective theme
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      root.setAttribute('data-theme', 'light');
    }

    // Immediately update browser tab favicons to match the effective theme
    updateFaviconForTheme(effectiveTheme);
  }, [effectiveTheme]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setPreference(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (err) {
      console.warn('Failed to persist theme choice:', err);
    }
  }, []);

  const resetToSystem = useCallback(() => {
    setPreference('system');
    try {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme: effectiveTheme,
        themePreference: preference,
        isDark: effectiveTheme === 'dark',
        setTheme,
        resetToSystem,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
