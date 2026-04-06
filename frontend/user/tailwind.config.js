/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#f97316",
          dark: "#ea580c",
        },
      },
      boxShadow: {
        card: "0 4px 24px -4px rgba(0,0,0,0.08), 0 2px 8px -2px rgba(249,115,22,0.12)",
      },
    },
  },
  plugins: [],
};
