/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#b89968",
        "brand-soft": "#f3ede2",
        soft: "#f5f1ea",
        fg: "#1d1d1f",
        muted: "#6b6b70",
        border: "#e8e6e1",
        warn: "#c98a3c",
        "warn-soft": "#f8ecd9",
        danger: "#c0533a",
        "danger-soft": "#f7e2dc",
      },
    },
  },
  plugins: [],
}