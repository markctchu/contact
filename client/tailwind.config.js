/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#f7f6f1",
        "surface-low": "#f1f1ec",
        "surface-container": "#e9e8e3",
        "surface-high": "#deddd8",
        "surface-lowest": "#ffffff",
        "on-surface": "#2e2f2c",
        "on-surface-variant": "#474844",
        primary: "#695b00",
        "primary-container": "#fadd30",
        "on-primary-container": "#211b00",
        tertiary: "#004ddc",
        "tertiary-fixed": "#96adff",
      },
      borderRadius: {
        'xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
