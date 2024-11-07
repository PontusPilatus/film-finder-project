/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6', // blue-500
          dark: '#2563eb',    // blue-600
        },
        secondary: {
          DEFAULT: '#64748b', // slate-500
          dark: '#475569',    // slate-600
        },
        background: {
          DEFAULT: '#0f172a', // slate-900
          light: '#1e293b',   // slate-800
        },
      },
    },
  },
  plugins: [],
} 