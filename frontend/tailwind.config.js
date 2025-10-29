/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx}" // Tells Tailwind to scan these files for class names
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Source Code Pro"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                serif: ['"Source Serif 4"', 'ui-serif', 'serif']
              },
            screens: {
                'custom600': '600px',
            }     
        },
    },
    plugins: [
        
    ],
};  