/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0D0A0F',
        'ink-mid': '#1A1420',
        'ink-soft': '#251C2E',
        gold: '#C9A96E',
        'gold-light': '#E8D5A8',
        'gold-bright': '#F0C060',
        rose: '#D4788A',
        'rose-deep': '#8B3A4A',
        surface: {
          0: '#0D0A0F',
          1: '#150F1C',
          2: '#1E1528',
          3: '#271C34',
          4: '#322241'
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        serif2: ['DM Serif Display', 'Georgia', 'serif'],
        body: ['Jost', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 40px rgba(201,169,110,0.16)',
        lux: '0 20px 60px rgba(0,0,0,0.65)'
      }
    }
  },
  plugins: []
};
