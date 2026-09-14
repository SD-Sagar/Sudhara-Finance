/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fbf8eb',
          100: '#f5eecc',
          200: '#efdf9e',
          300: '#e7cb68',
          400: '#e1b73e',
          500: '#d79e27',
          600: '#bc7b1f',
          700: '#965a1a',
          800: '#7b481c',
          900: '#673c1c',
        }
      },
      keyframes: {
        'slide-down': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'slide-down': 'slide-down 0.8s ease-out forwards',
        'fade-in': 'fade-in 1.5s ease-out forwards',
        'fade-in-up': 'fade-in-up 1s ease-out forwards',
        'fade-in-up-delayed': 'fade-in-up 1s ease-out 1.5s forwards', // Delays 1.5s so it appears after welcome
      }
    },
  },
  plugins: [],
}
