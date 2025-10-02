/** @type {import('tailwindcss').Config} */
export default {
  content: ['./**/*.html', './src/**/*.{js,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ["Raleway", "sans-serif"],
        serif: ["Grenze Gotisch", "serif"],
        mono: ["Space Mono", "monospace"],
        cursive: ["Borel", "cursive"]
      }
    }
  },
  plugins: [],
}
