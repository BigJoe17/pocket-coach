/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0ea5a4', // Teal 600
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#f97316', // Orange 500
          foreground: '#ffffff',
        },
        background: '#f4f7fb', // Cool cloud
        surface: '#ffffff',
        text: {
          primary: '#0f172a', // Slate 900
          secondary: '#475569', // Slate 600
          tertiary: '#94a3b8', // Slate 400
        },
        border: '#e2e8f0', // Slate 200
        danger: '#ef4444',
      }
    },
  },
  plugins: [],
}
