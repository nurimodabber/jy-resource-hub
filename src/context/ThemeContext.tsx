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

  const [glassOpacity, setGlassOpacityState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('jy_glass_opacity');
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= 0 && val <= 100) return val;
      }
    } catch {
      // LocalStorage unavailable
    }
    return 60; // Standard: 'Sanft' (60 %), ruhiger Look der alten Version
  });

  const setGlassOpacity = (val: number) => {
    const clamped = Math.min(100, Math.max(0, val));
    setGlassOpacityState(clamped);
    try {
      localStorage.setItem('jy_glass_opacity', String(clamped));
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    const opacity = glassOpacity / 100;
    root.style.setProperty('--glass-opacity', String(opacity));

    if (glassOpacity >= 100) {
      root.style.setProperty('--glass-blur', '0px');
      root.style.setProperty('--glass-specular', '0');
    } else {
      // Blur: 24px at 0% down to 10px at 98%
      const blurPx = Math.round(24 - (glassOpacity / 100) * 14);
      root.style.setProperty('--glass-blur', `${Math.max(8, blurPx)}px`);
      const specular = ((100 - glassOpacity) / 100) * 0.22;
      root.style.setProperty('--glass-specular', specular.toFixed(3));
    }
  }, [glassOpacity]);

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
