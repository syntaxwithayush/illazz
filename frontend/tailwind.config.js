/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          500: '#1677ff',
          600: '#0e62d9',
          700: '#094db2',
        },
        navy: {
          900: '#0d1527',
          800: '#172033',
          700: '#232f48',
        },
        slatebg: '#f7fbff',
        cardborder: '#e5edf5',
      },
      boxShadow: {
        card: '0 15px 45px rgba(30, 80, 130, 0.08)',
        soft: '0 5px 20px rgba(23, 54, 93, 0.05)',
        hover: '0 20px 40px rgba(22, 119, 255, 0.12)',
      }
    },
  },
  plugins: [],
}
