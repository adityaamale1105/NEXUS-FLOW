/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        obsidian: "#0B0B0D",
        charcoal: "#121214",
        graphite: "#191A1B",
        walnut: "#30251F",
        warmBrown: "#49372D",
        sage: "#A3B18A",
        emerald: "#6F987D",
        cyan: "#63D6D0",
        amber: "#D6A45D",
        ivory: "#F2EEE7",
        textPrimary: "#F4F1EB",
        textSecondary: "#A8A49C",
        textMuted: "#77736E",
        background: "#0B0B0D",
        surface: "#121214",
        surfaceLight: "#191A1B",
        border: "rgba(255, 255, 255, 0.09)",
        paypal: {
          blue: "#0070BA",
          dark: "#003087"
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "Courier New", "monospace"]
      }
    },
  },
  plugins: [],
}
