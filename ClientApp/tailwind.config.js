/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['Outfit', 'system-ui', 'sans-serif'],
        mono:    ['"DM Mono"', 'Menlo', 'monospace'],
      },
      colors: {
        ink: {
          950: '#0D0C0A',
          900: '#171512',
          800: '#201E1A',
          700: '#2C2924',
          600: '#3E3A34',
          400: '#7A7268',
          200: '#B8B0A4',
          100: '#D8D0C4',
        },
        cream:  '#EDE5D8',
        amber:  '#E8A020',
        scarlet:'#C4382A',
      },
    },
  },
  plugins: [],
}
