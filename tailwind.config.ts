import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4',
          400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e',
          800: '#115e59', 900: '#134e4a', 950: '#042f2e'
        },
        accent: {
          50:  '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
          400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
          800: '#92400e', 900: '#78350f'
        },
        ink: {
          50:  '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
          400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
          800: '#1e293b', 900: '#0f172a', 950: '#020617'
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-inter)', 'sans-serif']
      },
      borderRadius: { xl: '0.875rem', '2xl': '1.125rem' },
      boxShadow: {
        soft:    '0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.06)',
        'soft-md':'0 4px 6px -1px rgba(15,23,42,.05), 0 2px 4px -2px rgba(15,23,42,.04)',
        'soft-lg':'0 10px 25px -5px rgba(15,23,42,.07), 0 8px 10px -6px rgba(15,23,42,.05)',
        'soft-xl':'0 25px 50px -12px rgba(15,23,42,.12)'
      },
      keyframes: {
        'fade-in':   { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'fade-up':   { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'scale-in':  { '0%': { opacity: '0', transform: 'scale(0.96)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        'shimmer':   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } }
      },
      animation: {
        'fade-in':  'fade-in 200ms ease-out both',
        'fade-up':  'fade-up 280ms cubic-bezier(0.16,1,0.3,1) both',
        'scale-in': 'scale-in 240ms cubic-bezier(0.16,1,0.3,1) both',
        'shimmer':  'shimmer 1.6s linear infinite'
      }
    }
  },
  plugins: [forms, typography]
};

export default config;
