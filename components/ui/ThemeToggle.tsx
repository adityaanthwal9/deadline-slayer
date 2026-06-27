'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
    >
      {dark
        ? <Sun size={14} className="text-amber-400" />
        : <Moon size={14} className="text-blue-500" />
      }
    </button>
  );
}
