'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const DARK = {
  '--bg-base':     '#0A0A0F',
  '--bg-surface':  '#111118',
  '--bg-elevated': '#1A1A24',
  '--bg-card':     '#16161F',
  '--text-primary':   '#F8F8FC',
  '--text-secondary': '#9898B0',
  '--text-muted':     '#5C5C74',
  '--border':       'rgba(255,255,255,0.07)',
  '--border-hover': 'rgba(255,255,255,0.14)',
  '--input-bg':     '#1A1A24',
  '--sidebar-bg':   '#0D0D15',
  '--shadow-card':  '0 1px 3px rgba(0,0,0,0.4)',
  '--shadow-hover': '0 8px 24px rgba(0,0,0,0.5)',
};

const LIGHT = {
  '--bg-base':     '#F5F5F7',
  '--bg-surface':  '#EBEBF0',
  '--bg-elevated': '#E2E2EA',
  '--bg-card':     '#FFFFFF',
  '--text-primary':   '#0F0F1A',
  '--text-secondary': '#52526E',
  '--text-muted':     '#9090B0',
  '--border':       'rgba(0,0,0,0.07)',
  '--border-hover': 'rgba(0,0,0,0.14)',
  '--input-bg':     '#F0F0F5',
  '--sidebar-bg':   '#1A1A2E',  // stays dark like your CRM
  '--shadow-card':  '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  '--shadow-hover': '0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
};

const ThemeContext = createContext({ dark: true, toggle: () => {} });
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(true);

  const apply = (isDark: boolean) => {
    const vars = isDark ? DARK : LIGHT;
    const root = document.documentElement;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  };

  useEffect(() => {
    const isDark = localStorage.getItem('ds-theme') !== 'light';
    setDark(isDark);
    apply(isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    apply(next);
    localStorage.setItem('ds-theme', next ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
