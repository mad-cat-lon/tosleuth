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
      },
      animation: {
        'slide-in-down': 'slideInDown 0.5s ease-out forwards',
        'fade-out': 'fadeOut 0.5s ease-out forwards',
      },
    },
  },
  daisyui: {
    themes: ["light", "dark", "lofi", "dracula"]
  },
  plugins: [require("daisyui")],
}

