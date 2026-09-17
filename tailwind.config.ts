import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        workspace: "var(--bg-workspace)",
        surface: {
          DEFAULT: "var(--bg-surface)",
          subtle: "var(--bg-surface-subtle)",
          hover: "var(--bg-surface-hover)",
        },
        border: {
          DEFAULT: "var(--border-subtle)",
          strong: "var(--border-strong)",
        },
        ink: {
          DEFAULT: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        nav: {
          DEFAULT: "var(--emerald-nav)",
          surface: "var(--emerald-nav-surface)",
          border: "var(--emerald-nav-border)",
          hover: "var(--emerald-nav-hover)",
          text: "var(--emerald-nav-text)",
          muted: "var(--emerald-nav-muted)",
        },
        accent: {
          emerald: "var(--accent-emerald)",
          "emerald-subtle": "var(--accent-emerald-subtle)",
          amber: "var(--accent-amber)",
          "amber-subtle": "var(--accent-amber-subtle)",
          blue: "var(--accent-blue)",
          "blue-subtle": "var(--accent-blue-subtle)",
          rose: "var(--accent-rose)",
          "rose-subtle": "var(--accent-rose-subtle)",
        },
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "var(--shadow-card)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
