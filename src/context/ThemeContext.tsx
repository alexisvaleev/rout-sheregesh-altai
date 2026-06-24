import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { lightColors, darkColors, ThemeColors } from '../constants/themes';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
}

function getSavedTheme(): Theme {
  if (typeof window !== 'undefined') {
    try {
      const saved = window.localStorage.getItem('app-theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
  }
  return 'light';
}

// Синхронно читаем тему до первого рендера, чтобы не было белой вспышки
let _savedTheme = getSavedTheme();

// На вебе сразу красим body в цвет фона темы — до React
if (typeof document !== 'undefined') {
  const bodyBg = _savedTheme === 'dark' ? '#0D0D0D' : '#F8F9FA';
  document.body.style.backgroundColor = bodyBg;
  document.body.style.margin = '0';
  document.documentElement.style.backgroundColor = bodyBg;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: _savedTheme,
  isDark: _savedTheme === 'dark',
  toggleTheme: () => {},
  colors: _savedTheme === 'dark' ? darkColors : lightColors,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(_savedTheme);

  // При первом рендере читаем сохранённую тему
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('app-theme');
      if (saved === 'dark' || saved === 'light') {
        setTheme(saved);
      }
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('app-theme', next);
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggleTheme,
      colors: theme === 'dark' ? darkColors : lightColors,
    }),
    [theme, toggleTheme]
  );

  // Синхронизируем фон body на вебе
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const bg = theme === 'dark' ? darkColors.background : lightColors.background;
      document.body.style.backgroundColor = bg;
      document.body.style.margin = '0';
    }
  }, [theme]);

  // Также выставляем при монтировании (на случай, если sync-инициализация не отработала)
  const bgColor = theme === 'dark' ? darkColors.background : lightColors.background;

  return (
    <ThemeContext.Provider value={value}>
      <View style={{ flex: 1, backgroundColor: bgColor }}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useThemeColors(): ThemeColors {
  const ctx = useContext(ThemeContext);
  return ctx.colors;
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  return ctx;
}

export { ThemeContext };
