/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts,scss}"],
  important: true,
  theme: {
    extend: {
      colors: {
        senac: {
          50:  '#e6f0fb',
          100: '#c0d9f4',
          200: '#8bb8e9',
          500: '#0072ce',
          600: '#0054A6',
          700: '#003f90',
          800: '#003087',
          900: '#001f5b',
        },
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#312e81',
        },
        surface: '#f8fafc',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      }
    },
  },
  plugins: [],
}
