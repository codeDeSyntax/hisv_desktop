/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".no-scrollbar": {
          "-ms-overflow-style": "none", // IE and Edge
          "scrollbar-width": "none", // Firefox
        },
        ".no-scrollbar::-webkit-scrollbar": {
          display: "none", // Chrome, Safari, Opera
        },
        '.thin-scrollbar': {
          'scrollbar-width': 'thin',
          '&::-webkit-scrollbar': {
            width: '6px', // Adjust width as needed
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#5ECFFF', // Optional: Customize the scrollbar color
          },
        },
      });
    },
  ],
}
