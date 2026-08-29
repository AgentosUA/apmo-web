/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      screens: {
        mobile: { max: '600px' },
        tablet: { max: '1199px' },
        desktop: '1200px',
      },
      colors: {
        'a3-orange': '#A16C14',
        'a3-grey': '#808080',
        'a3-red': '#9F0F0F',
        'a3-black': '#000000',
        'a3-panel': 'rgba(7, 11, 10, 0.7)',
        'a3-surface': 'rgba(0, 0, 0, 0.7)',
        marker: {
          default: '#ffffff',
          black: '#000000',
          grey: '#808080',
          red: '#E60000',
          brown: '#804000',
          orange: '#D96600',
          yellow: '#D9D900',
          khaki: '#809966',
          green: '#00CC00',
          blue: '#0000FF',
          pink: '#FF4D66',
          white: '#FFFFFF',
          west: '#004D99',
          east: '#800000',
          guer: '#008000',
          civ: '#660080',
          unknown: '#B39900',
          blufor: '#004D99',
          opfor: '#800000',
          independent: '#008000',
          civilian: '#660080',
          fd1: '#B13339',
          fd2: '#ADBFB3',
          fd3: '#F08231',
          fd4: '#678B9C',
          fd5: '#B040A7',
          fd6: '#5A595A',
        },
      },
      keyframes: {
        'white-blink': {
          '0%': { backgroundColor: 'rgba(255, 255, 255, 0.5)' },
          '50%': { backgroundColor: 'rgba(255, 255, 255, 1)' },
          '100%': { backgroundColor: 'rgba(255, 255, 255, 0.5)' },
        },
        overlayShow: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        contentShow: {
          from: { opacity: '0', transform: 'translate(-50%, -48%) scale(0.96)' },
          to: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
        },
        'show-title': {
          from: { fontSize: '0', maxWidth: '0' },
          to: { fontSize: '14px', maxWidth: '270px' },
        },
        'hide-title': {
          from: { fontSize: '14px', maxWidth: '270px' },
          to: { fontSize: '0', maxWidth: '0', overflow: 'hidden', padding: '0' },
        },
        'show-content': {
          from: { maxHeight: '0', overflow: 'hidden' },
          to: { maxHeight: '32px' },
        },
        'hide-content': {
          from: { maxHeight: '32px' },
          to: { overflow: 'hidden', maxHeight: '0' },
        },
        'lds-ring': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'white-blink': 'white-blink 2s infinite',
        overlayShow: 'overlayShow 150ms cubic-bezier(0.16, 1, 0.0, 1)',
        contentShow: 'contentShow 150ms cubic-bezier(0.16, 1, 0.0, 1)',
        'show-title':
          'show-title 220ms ease-in 0ms 1 normal forwards, hide-title 220ms ease-out 3700ms 1 normal forwards',
        'show-content':
          'show-content 220ms ease-in 325ms 1 normal forwards, hide-content 220ms ease-out 3300ms 1 normal forwards',
        'lds-ring': 'lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
      },
    },
  },
  plugins: [],
};
