/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*{js,jsx,tx,tsx}", "./public/index.html"],
  theme: {
    fontFamily: {
      dosis: ["Dosis", "sans-serif"],
      kanit: ["Kanit", "sans-serif"],
      montserrat: ["Montserrat", "sans-serif"],
      mukta: ["Mukta", "sans-serif"],
      nunito: ["Nunito", "sans-serif"],
      openSans: ["Open+Sans", "sans-serif"],
    },
    extend: {
      colors: {
        "mexican-red": {
          DEFAULT: "#9F2A2A",
          50: "#F8EBE4",
          100: "#F2D7CC",
          200: "#E5AC9C",
          300: "#D87B6C",
          400: "#CB463B",
          500: "#9F2A2A",
          600: "#83232A",
          700: "#661B26",
          800: "#4A1420",
          900: "#2E0C16",
        },
      },
      animation: {
        pulseIndefinitely0: "slowPulse 1800ms linear infinite",
        pulseIndefinitely1: "slowPulse 1800ms linear infinite 600ms",
        pulseIndefinitely2: "slowPulse 1800ms linear infinite 900ms",
        // pulseIndefinitely0: "slowPulse 4s linear infinite 1s",
        // pulseIndefinitely1: "slowPulse 4s linear infinite 2s",
        // pulseIndefinitely2: "slowPulse 4s linear infinite 3s",
      },
      keyframes: {
        slowPulse: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.3 },
        },
      },
    },
  },
  // plugins: [],
  // safelist: [],
};
