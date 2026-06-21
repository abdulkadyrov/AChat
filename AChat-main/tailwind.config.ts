import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#f6f2e8",
          dark: "#111926"
        },
        ink: {
          DEFAULT: "#18212f",
          soft: "#617088",
          inverse: "#f9fafb"
        },
        accent: {
          DEFAULT: "#0b7a43",
          soft: "#d9f7e8",
          dark: "#17c964"
        },
        bubble: {
          mine: "#ddf7c8",
          theirs: "#ffffff",
          mineDark: "#184b35",
          theirsDark: "#1d2635"
        }
      },
      borderRadius: {
        bubble: "16px",
        shell: "28px"
      },
      boxShadow: {
        shell: "0 24px 60px rgba(25, 35, 52, 0.12)",
        card: "0 18px 40px rgba(20, 26, 38, 0.08)"
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      spacing: {
        4.5: "1.125rem"
      },
      backgroundImage: {
        paper:
          "radial-gradient(circle at top, rgba(11,122,67,0.12), transparent 35%), linear-gradient(180deg, rgba(255,255,255,0.95), rgba(246,242,232,0.92))",
        night:
          "radial-gradient(circle at top, rgba(23,201,100,0.12), transparent 35%), linear-gradient(180deg, rgba(17,25,38,0.98), rgba(11,17,27,0.98))"
      }
    }
  },
  plugins: []
} satisfies Config;
