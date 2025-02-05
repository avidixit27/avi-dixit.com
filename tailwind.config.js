/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#f0f4f8', // Light gray-blue background
        secondary: '#64ffda',
        slate: '#8892b0',
        light: '#1a202c', // Darker text for contrast
        accent: '#2d3748', // For secondary text and elements
        accentWarm: '#fd7100', // Orange accent
        accentCool: '#000afd', // Blue accent
        accentVivid: '#d035fd' // Purple accent
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}