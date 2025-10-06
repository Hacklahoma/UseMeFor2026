/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // Tells Tailwind to scan these files for class names
  ],
  theme: {
    extend: {
      extend: {
        fontFamily: {
          sans: ['"Source Sans 3"', "ui-sans-serif", "system-ui", "sans-serif"],
        },
      },
    },
  },
  plugins: [],
};
