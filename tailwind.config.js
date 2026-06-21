export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#111827",
        clinic: "#B499AC",
        mint: "#F4CBC0",
        mauve: "#C8A4BE",
        petal: "#DDB3C9",
        blush: "#F4CBC0",
        rose: "#ECABAF",
        accent: "#F18DB1",
        pearl: "#F8FAFC",
        plum: "#5B2B6D"
      },
      boxShadow: {
        soft: "0 24px 80px rgba(15, 23, 42, 0.10)"
      }
    }
  },
  plugins: []
};
