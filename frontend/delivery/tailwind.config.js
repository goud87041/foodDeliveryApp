/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: { primary: { DEFAULT: "#f97316", dark: "#ea580c" } },
    },
  },
  plugins: [],
};
