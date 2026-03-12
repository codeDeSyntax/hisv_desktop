/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2f2f2f", // ChatGPT card/surface bg
        background: "#171717", // ChatGPT deepest bg (sidebar)
        surface: "#212121", // ChatGPT main chat area
        text: "#ececec", // ChatGPT primary text
        muted: "#8e8ea0", // ChatGPT secondary/muted text
        border: "#383838", // ChatGPT subtle borders
        accent: "var(--accent)", // dynamic accent – set by Theme provider
        // Override warm stone shades → ChatGPT cool neutrals (affects all dark:bg-stone-* classes)
        stone: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
          400: "#a8a29e",
          500: "#737373",
          600: "#525252",
          700: "#3f3f3f", // ChatGPT hover/border surface
          800: "#2f2f2f", // ChatGPT card / input bg
          900: "#212121", // ChatGPT main bg
          950: "#171717", // ChatGPT deepest / sidebar
        },
      },
      fontFamily: {
        outfit: ['"Outfit"', "ui-sans-serif", "sans-serif"],
        cooper: ['"Cooper Black"', "sans-serif"],
        archivo: ['"Archivo Black"', "sans-serif"],
        zilla: ['"Zilla Slab"', "Palatino"],
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
