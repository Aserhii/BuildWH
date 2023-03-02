const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["'Inter'", "sans-serif"],
      serif: ["Times", "serif"],
    },
    extend: {
      colors: {
        gray: colors.neutral,
      }
    }
  },
  plugins: [],
}
