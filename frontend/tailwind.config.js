/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sidebar: '#1a0d13',
        burgundy: {
          DEFAULT: '#4A1020',
          light: '#6B1830',
          dark: '#2E0A14',
        },
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
