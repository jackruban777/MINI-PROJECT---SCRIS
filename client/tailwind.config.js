/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#EFF6FF',
          dark: '#1E3A5F',
        },
        navy: {
          DEFAULT: '#1E3A5F',
          dark: '#0F1E36',
          light: '#2D5584',
        },
        page: '#F8FAFC',
        text: {
          primary: '#0F172A',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        border: {
          DEFAULT: '#E2E8F0',
          dark: '#CBD5E1',
        },
        risk: {
          safe: {
            bg: '#ECFDF5',
            text: '#065F46',
            border: '#A7F3D0',
            badge: '#10B981',
          },
          watch: {
            bg: '#FFFBEB',
            text: '#92400E',
            border: '#FDE68A',
            badge: '#F59E0B',
          },
          critical: {
            bg: '#FEF2F2',
            text: '#991B1B',
            border: '#FECACA',
            badge: '#EF4444',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'dropdown': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'modal': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
}
