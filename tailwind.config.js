/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
    "./src/partials/**/*.html",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      screens: {
        'xl': '1200px',
        '3xl': '1800px',
      },
      fontFamily: {
        montserrat: ['"Montserrat"', 'sans-serif'],
        sans: ['"Montserrat"', 'sans-serif'],
      },
      colors: {
        main: '#101F26',
        brandGreen: '#20B1AA'
      },
    },
  },
  plugins: [],
}