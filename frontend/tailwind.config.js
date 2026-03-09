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
          white: '#F8F9FA',
          blue: '#007BFF',
          indigo: '#6610F2',
          orange: '#FD7E14',
          gray: '#DBDAD7',
          green: '#22D3A0',
          dark: '#0f172a' 
        }
      }
    },
  },
  plugins: [],
}