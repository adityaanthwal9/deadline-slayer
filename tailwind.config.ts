import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        card:        { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        surface:     { DEFAULT: 'hsl(var(--surface))', elevated: 'hsl(var(--surface-elevated))' },
        border:      'hsl(var(--border))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
        muted:       { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent:      { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        amber: {
          DEFAULT: '#F59E0B',
          dim:    'rgba(245,158,11,0.10)',
          glow:   'rgba(245,158,11,0.20)',
        },
        danger:  { DEFAULT: '#EF4444', dim: 'rgba(239,68,68,0.10)' },
        success: { DEFAULT: '#10B981', dim: 'rgba(16,185,129,0.10)' },
        warning: { DEFAULT: '#F97316', dim: 'rgba(249,115,22,0.10)' },
        info:    { DEFAULT: '#6366F1', dim: 'rgba(99,102,241,0.10)' },
      },
      fontFamily: {
        sans:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        sm: '6px', md: '10px', lg: '14px', xl: '20px',
      },
      boxShadow: {
        card:        '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'card-hover':'0 4px 16px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)',
        glass:       '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
        'glow-amber':'0 0 24px rgba(245,158,11,0.2), 0 0 8px rgba(245,158,11,0.1)',
        'glow-red':  '0 0 24px rgba(239,68,68,0.2), 0 0 8px rgba(239,68,68,0.1)',
        'glow-sm':   '0 0 12px rgba(245,158,11,0.15)',
      },
      animation: {
        'fade-up':   'fadeUp 350ms cubic-bezier(0.22,1,0.36,1) forwards',
        'fade-in':   'fadeIn 300ms ease forwards',
        'shimmer':   'shimmer 1.6s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow':'pulse 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:  { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
