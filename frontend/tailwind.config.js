/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
          
          darkBg: '#111827',     
          darkCard: '#1F2937',   
          darkBorder: '#374151',
          darkText: '#9CA3AF',   
        }
      }
    },
  },
  plugins: [],
}