import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'system' | 'light' | 'dark' | 'contrast';

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
      if (saved === 'light' || saved === 'dark' || saved === 'contrast' || saved === 'system') {
        return saved as Theme;
      }
    } catch {
      // LocalStorage unavailable
    }
    return 'system';
  });

  // Fixed standard glass opacity: 25% (0.25 opacity, 20px blur, 0.165 specular), not adjustable
  const glassOpacity = 25;
  const setGlassOpacity = () => {};

  useEffect(() => {
    const root = document.documentElement;
    // Enforce fixed 25% standard glass opacity across the app
    root.style.setProperty('--glass-opacity', '0.25');
    root.style.setProperty('--glass-blur', '20px');
    root.style.setProperty('--glass-specular', '0.165');
    // Clear any obsolete custom glass opacity stored previously in localStorage
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
      const isHighContrast = theme === 'contrast';
      const resolvedDark =
        theme === 'dark' || isHighContrast ? true : theme === 'light' ? false : mediaQuery.matches;

      setIsDark(resolvedDark);
      if (resolvedDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      if (isHighContrast) {
        root.classList.add('contrast');
      } else {
        root.classList.remove('contrast');
      }

      // Keep meta theme-color strictly in sync with theme background
      const activeThemeColor = isHighContrast ? '#000000' : resolvedDark ? '#0D131F' : '#F7F9FC';
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

  const isContrast = theme === 'contrast';

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
