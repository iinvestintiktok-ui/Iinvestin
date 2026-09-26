/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono: ['"Space Grotesk"', 'monospace'],
      },
      colors: {
        base: {
          DEFAULT: '#0a0a0c',
          card: '#131316',
          'card-hover': '#1a1a1f',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        gain: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        loss: {
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
        },
        neutral: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
};
