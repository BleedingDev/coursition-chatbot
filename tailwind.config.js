const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  mode: 'jit',
  darkMode: 'class',
  content: ['./index.html', './ui/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
};
