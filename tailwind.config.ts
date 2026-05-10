import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Indigo / electric cobalt — replaces teal. Serious + modern + not AI-template.
        brand: {
          50:  '#EEF2FF', 100: '#E0E7FF', 200: '#C7D2FE', 300: '#A5B4FC',
          400: '#818CF8', 500: '#6366F1', 600: '#4F46E5', 700: '#4338CA',
          800: '#3730A3', 900: '#312E81', 950: '#1E1B4B'
        },
        // Warm coral / terracotta — replaces amber. Editorial warmth against the indigo.
        accent: {
          50:  '#FFF4EE', 100: '#FFE3D3', 200: '#FFC2A4', 300: '#FF9A6B',
          400: '#FF7448', 500: '#F25C42', 600: '#D9412C', 700: '#B12F22',
          800: '#8B231A', 900: '#671A14'
        },
        // Ink stays slate-ish but slightly cooled. ink-950 = near-black for editorial sections.
        ink: {
          50:  '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1',
          400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334155',
          800: '#1E293B', 900: '#0F172A', 950: '#05070D'
        },
        // Warm off-white for editorial backgrounds — used sparingly.
        cream: {
          50:  '#FAF7F2', 100: '#F5EFE5'
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-inter)', 'sans-serif'],
        // Editorial serif for emphasis moments — used in pull-quotes and section eyebrows
        serif: ['var(--font-serif)', 'Georgia', 'serif']
      },
      borderRadius: { xl: '0.875rem', '2xl': '1.125rem', '3xl': '1.5rem' },
      boxShadow: {
        soft:    '0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.06)',
        'soft-md':'0 4px 6px -1px rgba(15,23,42,.05), 0 2px 4px -2px rgba(15,23,42,.04)',
        'soft-lg':'0 10px 25px -5px rgba(15,23,42,.07), 0 8px 10px -6px rgba(15,23,42,.05)',
        'soft-xl':'0 25px 50px -12px rgba(15,23,42,.12)',
        // Inset highlight for dark editorial cards
        'inset-hi': 'inset 0 1px 0 0 rgba(255,255,255,0.08)',
        // Cobalt glow for primary CTA on hover
        'glow-brand': '0 0 0 1px rgba(99,102,241,0.4), 0 8px 24px -4px rgba(79,70,229,0.5)'
      },
      keyframes: {
        'fade-in':   { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'fade-up':   { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'scale-in':  { '0%': { opacity: '0', transform: 'scale(0.96)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        'shimmer':   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        // Conic rotation for the primary CTA's shimmer ring (referenced from globals.css)
        'spin-slow':  { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
        'float-y':   { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        // Brand accent line that sweeps under a word as it mounts
        'underline-sweep': { '0%': { transform: 'scaleX(0)' }, '100%': { transform: 'scaleX(1)' } },
        'marquee-x':  { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } }
      },
      animation: {
        'fade-in':  'fade-in 200ms ease-out both',
        'fade-up':  'fade-up 280ms cubic-bezier(0.16,1,0.3,1) both',
        'scale-in': 'scale-in 240ms cubic-bezier(0.16,1,0.3,1) both',
        'shimmer':  'shimmer 1.6s linear infinite',
        'spin-slow':'spin-slow 8s linear infinite',
        'float-y':  'float-y 4s ease-in-out infinite',
        'underline-sweep': 'underline-sweep 700ms cubic-bezier(0.65,0,0.35,1) both',
        'marquee':  'marquee-x 40s linear infinite'
      }
    }
  },
  plugins: [forms, typography]
};

export default config;
