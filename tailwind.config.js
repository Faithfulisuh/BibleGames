/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./bibleVersePuzzle/**/*.{js,jsx,ts,tsx}",
    "./guessTheVerse/**/*.{js,jsx,ts,tsx}",
    "./reviews/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Light theme colors (default)
        light: {
          // Text colors
          textPrimary: "#374151", // Dark Gray - Main text, headings
          textSecondary: "#6B7280", // Medium Gray - Descriptions, metadata

          // Background colors
          background: "#FFFFFF", // White background
          cardBackground: "#FFFFFF", // White card background
          surface: "#F9FAFB", // Light surface background
          border: "#E5E7EB", // Light border color

          // Accent colors
          goldAccent: "#F5F3C7", // Gold Accent - Achievements & Scores
          lightBlue: "#DBEAFE", // Light Blue - Timer & Progress
          lightGreen: "#D1FAE5", // Light Green - Success States
          lightPurple: "#E0D7FF", // Light Purple - Verse Fragments
        },

        // Dark theme colors
        dark: {
          // Text colors
          textPrimary: "#F9FAFB", // Light gray - Main text, headings
          textSecondary: "#D1D5DB", // Medium light gray - Descriptions, metadata

          // Background colors
          background: "#111827", // Dark background
          cardBackground: "#1F2937", // Dark card background
          surface: "#374151", // Dark surface background
          border: "#4B5563", // Dark border color

          // Accent colors
          goldAccent: "#92400E", // Darker Gold Accent
          lightBlue: "#1E40AF", // Darker Blue
          lightGreen: "#065F46", // Darker Green
          lightPurple: "#5B21B6", // Darker Purple
        },

        // Text colors (auto-adapting)
        textPrimary: "#374151", // Will be overridden by theme
        textSecondary: "#6B7280", // Will be overridden by theme

        // Background colors
        lightGray: "#F5F5F5", // Light Gray
        mediumGray: "#6B7280", // Medium Gray
        darkGray: "#374151", // Dark Gray

        // Accent colors
        goldAccent: "#F5F3C7", // Gold Accent - Achievements & Scores
        lightBlue: "#DBEAFE", // Light Blue - Timer & Progress
        lightGreen: "#D1FAE5", // Light Green - Success States
        lightPurple: "#E0D7FF", // Light Purple - Verse Fragments

        // Gradient colors
        greenGradientStart: "#10B981", // Green Gradient - Community Reviews
        greenGradientEnd: "#059669", // Green Gradient End
        orangeGradientStart: "#F59E0B", // Orange Gradient - Daily Challenge
        orangeGradientEnd: "#D97706", // Orange Gradient End
        purpleGradientStart: "#8B5CF6", // Purple Gradient - Bible Verse Puzzle
        purpleGradientEnd: "#7C3AED", // Purple Gradient End
        blueGradientStart: "#3B82F6", // Blue Gradient - Guess the Verse
        blueGradientEnd: "#2563EB", // Blue Gradient End

        // Functional colors
        subtleBackground: "#F5F5F5", // Subtle Backgrounds - Drop zones, inactive states
        success: "#10B981", // Success color
        error: "#EF4444", // Error color
        warning: "#F59E0B", // Warning color
        info: "#3B82F6", // Info color
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
