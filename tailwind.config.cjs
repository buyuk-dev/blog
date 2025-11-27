/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{astro,html,js,jsx,ts,tsx,vue}",
  ],
  theme: {
    extend: {
      animation: {
        'meteor-effect': 'meteor 5s linear infinite',
        'meteor-debris': 'meteor-debris 5s linear infinite',
      },
      keyframes: {
        meteor: {
          '0%': {
            transform: 'rotate(215deg) translateX(0)',
            opacity: '1'
          },
          '70%': {
            opacity: '1'
          },
          '100%': {
            transform: 'rotate(215deg) translateX(-2000px)',
            opacity: '0',
          },
        },
        'meteor-debris': {
          '0%': {
            transform: 'rotate(215deg) translateX(0)',
            opacity: '1',
            filter: 'brightness(1)',
          },
          '15%': {
            opacity: '0.85',
            filter: 'brightness(1.1)',
          },
          '30%': {
            opacity: '1',
            filter: 'brightness(0.95)',
          },
          '45%': {
            opacity: '0.9',
            filter: 'brightness(1.15)',
          },
          '60%': {
            opacity: '1',
            filter: 'brightness(1)',
          },
          '70%': {
            opacity: '0.8',
          },
          '100%': {
            transform: 'rotate(215deg) translateX(-2000px)',
            opacity: '0',
            filter: 'brightness(1)',
          },
        },
      },
    },
  },
  plugins: [],
};
