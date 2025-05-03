/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'medical-green': '#00FFAB',
        'medical-green-dark': '#00CC89',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
} 