/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Ensures Tailwind scans all relevant files
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FFFFFF",
        secondary: "#2b7fff",
        bgColor: "#F5F6FA",
      },
    },
  },
  plugins: [],
};
