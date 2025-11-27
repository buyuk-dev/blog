/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{astro,html,js,jsx,ts,tsx,vue}",
  ],
  theme: {
    extend: {
      animation: {
        'meteor-effect': 'meteor 5s linear infinite',
      },
      keyframes: {
        meteor: {
          '0%': {
            transform: 'rotate(45deg) translate(0, 0)',
            opacity: '0'
          },
          '5%': {
            opacity: '1'
          },
          '80%': {
            opacity: '1'
          },
          '100%': {
            transform: 'rotate(45deg) translate(1200px, 1200px)',
            opacity: '0',
          },
        },
      },
    },
  },
  plugins: [],
};
