/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#a3f058', // Vibrant Lime Green (from screenshot!)
          500: '#84cc16',
          600: '#65a30d',
          700: '#4d7c0f',
          800: '#3f6212',
          900: '#365314',
          950: '#1a2e05',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'flat': '4px 4px 0px 0px #000000', // Solid pure black offset
        'flat-lg': '6px 6px 0px 0px #000000',
        'flat-sm': '2px 2px 0px 0px #000000',
        'flat-light': '4px 4px 0px 0px #f8fafc', // Solid off-white for dark mode
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 12px -1px rgba(0, 0, 0, 0.03)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
