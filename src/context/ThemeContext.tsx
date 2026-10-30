import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'system' | 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  isContrast: boolean;
  setTheme: (theme: Theme) => void;
  glassOpacity: number;
  setGlassOpacity: (opacity: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('jy_theme');
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved as Theme;
      }
      if (saved === 'contrast') {
        return 'dark'; // Cleanly migrate old contrast preference to dark
      }
    } catch {
      // LocalStorage unavailable
    }
    return 'system';
  });

  const glassOpacity = 78;
  const setGlassOpacity = () => {};

  useEffect(() => {
    const root = document.documentElement;
    // Clean up any stale inline styles or legacy keys
    root.style.removeProperty('--glass-opacity');
    root.style.removeProperty('--glass-blur');
    root.style.removeProperty('--glass-specular');
    root.classList.remove('contrast');
    try {
      localStorage.removeItem('jy_glass_opacity');
    } catch {
      /* ignore */
    }
  }, []);

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    return media.matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const resolvedDark =
        theme === 'dark' ? true : theme === 'light' ? false : mediaQuery.matches;

      setIsDark(resolvedDark);
      if (resolvedDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      root.classList.remove('contrast');

      // Keep meta theme-color strictly in sync with theme background
      const activeThemeColor = resolvedDark ? '#0E1522' : '#F7F9FC';
      const metas = document.querySelectorAll('meta[name="theme-color"]');
      metas.forEach((meta) => {
        meta.setAttribute('content', activeThemeColor);
      });
    };

    applyTheme();
    localStorage.setItem('jy_theme', theme);

    const listener = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  const isContrast = false;

  return (
    <ThemeContext.Provider value={{ theme, isDark, isContrast, setTheme, glassOpacity, setGlassOpacity }}>
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
