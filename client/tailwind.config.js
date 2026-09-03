/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: '#07080b',
        room1: '#0c0d11',
        room2: '#050506',
        panel: '#121319',
        panel2: '#181a22',
        gold: '#f0b75b',
        goldSoft: '#f9dca0',
        goldDim: '#7a5a2c',
        ink: '#f4f1ea',
        inkDim: '#9a978c',
        inkFaint: '#5c594f',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 8px 24px -8px rgba(240,183,91,0.45)',
      },
    },
  },
  plugins: [],
};
