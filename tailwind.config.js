/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        foreground: "#f4f4f5",
        card: {
          DEFAULT: "#121215",
          hover: "#1a1a1e",
          border: "#27272a"
        },
        muted: {
          DEFAULT: "#27272a",
          foreground: "#a1a1aa"
        },
        accent: {
          DEFAULT: "#2563eb",
          foreground: "#ffffff"
        }
      }
    },
  },
  plugins: [],
}
