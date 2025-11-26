/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'a3-orange': '#a16c14',
        'a3-grey': '#808080',
      },
      keyframes: {
        'white-blink': {
          '0%': { backgroundColor: 'rgba(255, 255, 255, 0.5)' },
          '50%': { backgroundColor: 'rgba(255, 255, 255, 1)' },
          '100%': { backgroundColor: 'rgba(255, 255, 255, 0.5)' },
        },
      },
      animation: {
        'white-blink': 'white-blink 2s infinite',
      },
    },
  },
  plugins: [],
};
