/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./bibleVersePuzzle/**/*.{js,jsx,ts,tsx}",
    "./guessTheVerse/**/*.{js,jsx,ts,tsx}",
    "./reviews/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#FF6D00", // Bright orange
        secondary: "#9C27B0", // Vibrant purple
        accent: "#FFEA00", // Bright yellow
        background: "#7B1FA2", // Vibrant purple gradient start
        backgroundEnd: "#FF4081", // Bright pink gradient end
        cardBg: "#FFFFFF", // White card background
        inputBg: "#F5F5F5", // Light input background
        success: "#00E676", // Bright green for success messages
        error: "#FF1744", // Bright red for error messages
        textDark: "#212121", // Very dark gray (almost black) text
        textMedium: "#757575", // Medium gray text
        textLight: "#BDBDBD", // Light gray text
        buttonBlue: "#2979FF", // Bright blue for buttons
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
