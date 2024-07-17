/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./src/**/*.{js, jsx}", "./public/index.html"],
  theme: {
    extend: {
       keyframes: {
        slideInDown: {
          '0%': {
            transform: 'translateY(-100%)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        fadeOut: {
          '0%': {
            opacity: '1',
          },
          '100%': {
            opacity: '0',
            display: 'none',
          },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
      },
      animation: {
        'slide-in-down': 'slideInDown  2s ease-out forwards',
        'fade-out': 'fadeOut 0.5s ease-out forwards',
        'shake': 'shake 0.82s cubic-bezier(.36,.07,.19,.97) both',
      },
    },
  },
  daisyui: {
    themes: ["light", "dark", "lofi", "dracula"]
  },
  plugins: [require("daisyui")],
}

