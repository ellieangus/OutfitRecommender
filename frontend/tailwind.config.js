/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'brand-pink':    '#d292a8',
        'brand-dark':    '#A92F50',
        'warm-rose':     '#E5A2A0',
        'dusty-coral':   '#D3968C',
        'golden-cream':  '#EDDA8C',
        'burgundy':      '#5F0C2F',
        'deep-burgundy': '#670626',
        'cream':         '#FFF1B5',
        sidebar:         '#5F0C2F',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['Lora', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
