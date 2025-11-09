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
        accentVivid: '#d035fd', // Purple accent
        ink: "#0a0a0a",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: ["Inter", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        card: "0 2px 18px rgba(0,0,0,0.06)",
        hairline: "0 1px 0 rgba(0,0,0,0.06)",
      },
      borderRadius: {
        soft: "10px",
      },
      transitionTimingFunction: {
        soft: "cubic-bezier(.22,.61,.36,1)",
        gentle: "cubic-bezier(.4,0,.2,1)",
      },
    },
    container: { center: true, padding: "1rem" },
    },
  plugins: [],
};