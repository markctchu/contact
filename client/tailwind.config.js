/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "var(--surface)",
        "surface-low": "var(--surface-low)",
        "surface-container": "var(--surface-container)",
        "surface-high": "var(--surface-high)",
        "surface-lowest": "var(--surface-lowest)",
        "on-surface": "var(--on-surface)",
        "on-surface-variant": "var(--on-surface-variant)",
        primary: "var(--primary)",
        "primary-container": "var(--primary-container)",
        "on-primary-container": "var(--on-primary-container)",
        tertiary: "var(--tertiary)",
        "tertiary-fixed": "var(--tertiary-fixed)",
        "outline-variant": "var(--outline-variant)",
      },
      borderRadius: {
        'xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
