/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        black: "#000000",
        dark: "#1a1a1a",
        white: "#ffffff",
        red: {
          DEFAULT: "#FF0000"
        },
        whatsapp: {
          DEFAULT: "#25D366"
        }
      }
    }
  },
  plugins: [],
  darkMode: "class"
};
