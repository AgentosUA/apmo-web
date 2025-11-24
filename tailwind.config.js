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
    },
  },
  plugins: [],
};
