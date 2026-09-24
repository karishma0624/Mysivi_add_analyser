import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          DEFAULT: '#4F46E5',
          600: '#4338CA',
          700: '#3730A3',
          800: '#312E81',
          900: '#1E1B4B',
          purple: '#7C3AED',
          purpleLight: '#A78BFA',
        },
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        card: '0 8px 24px -8px rgba(79,70,229,0.12), 0 2px 6px -2px rgba(0,0,0,0.04)',
        'card-hover': '0 20px 32px -10px rgba(79,70,229,0.22), 0 4px 12px -2px rgba(0,0,0,0.06)',
        'glow-brand': '0 0 25px -5px rgba(79, 70, 229, 0.4)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
