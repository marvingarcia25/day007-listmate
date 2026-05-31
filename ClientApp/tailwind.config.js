/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
      },
      boxShadow: {
        'card': '0 1px 4px 0 rgba(0,0,0,0.06), 0 4px 16px 0 rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.10), 0 8px 32px 0 rgba(0,0,0,0.06)',
        'glow': '0 0 0 3px rgba(37,99,235,0.15)',
      },
      borderRadius: {
        'xl2': '1rem',
        'xl3': '1.25rem',
      },
    },
  },
  plugins: [],
}
