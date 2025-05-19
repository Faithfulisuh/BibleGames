/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./bibleVersePuzzle/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#3e38af", // Primary blue - headers, titles
        secondary: "#574bdb", // Secondary blue - buttons, accents
        accent: "#a3a8f0", // Light blue - borders, highlights
        background: "#f6f8ff", // Light background
        cardBg: "#ffffff", // Card background
        inputBg: "#f2f5fe", // Input background
        success: "#22c55e", // Green for success messages
        error: "#ef4444", // Red for error messages
        textDark: "#3e38af", // Dark text (blue)
        textMedium: "#7c7c7c", // Medium text (gray)
        textLight: "#b0b5d6" // Light text (light blue)
      },
      fontFamily: {
        pthin: ["Poppins-Thin", "sans-serif"],
        pextralight: ["Poppins-ExtraLight", "sans-serif"],
        plight: ["Poppins-Light", "sans-serif"],
        pregular: ["Poppins-Regular", "sans-serif"],
        pmedium: ["Poppins-Medium", "sans-serif"],
        psemibold: ["Poppins-SemiBold", "sans-serif"],
        pbold: ["Poppins-Bold", "sans-serif"],
        pextrabold: ["Poppins-ExtraBold", "sans-serif"],
        pblack: ["Poppins-Black", "sans-serif"],
      },
    },
  },
  plugins: [],
};
