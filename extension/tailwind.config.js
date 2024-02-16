/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js, jsx}", "./public/index.html"],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: ["light", "dark", "lofi", "dracula"]
  },
  plugins: [require("daisyui")],
}

