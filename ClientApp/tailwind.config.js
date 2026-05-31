/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f0fdf9',
          100: '#ccfbef',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
        },
      },
    },
  },
  plugins: [],
}
