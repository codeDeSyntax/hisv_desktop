/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#292524",
        background: "#1c1917",
        text:"#f5f5f4",
        border:"#292524",
        accent:"#a8a29e"
      },
      fontFamily: {
        anton: ['"Anton SC"', "sans-serif"],
        bigshoulders: ['"Big Shoulders Thin"', "sans-serif"],
        bitter: ['"Bitter Thin"', "sans-serif"],
        oswald: ['"Oswald ExtraLight"', "sans-serif"],
        archivo: ['"Archivo Black"', "sans-serif"],
        roboto: ['"Roboto Thin"', "sans-serif"],
        cooper: ['"Cooper Black"', "sans-serif"],
        haettenschweiler: ['"Haettenschweiler"', "sans-serif"],
        impact: ['"Impact"', "sans-serif"],
        teko: ['"Teko Light"', "sans-serif"],
        alumini: ['"Alumini Sans Black"', "sans-serif"],
        zilla:['"Zilla Slab"', "Palatino"]
      },
    },
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
        ".thin-scrollbar": {
          "scrollbar-width": "thin",
          "&::-webkit-scrollbar": {
            width: "6px", // Adjust width as needed
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#5ECFFF", // Optional: Customize the scrollbar color
          },
        },
      });
    },
  ],
};
export const darkMode = "class";
