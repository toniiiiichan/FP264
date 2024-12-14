/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "app/public/**/*.{html,js,css}",
    "app/**/*.{js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        customeBlue: "1DA1F2",
      }
    },
  },
  plugins: [],
}

