import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    // MENTOR OS routes live under app/mentor-os and render Tailwind classes
    // directly (layout, pages); without this glob those classes get purged.
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    // Appointment portal components
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        workspace: "var(--bg-workspace)",
        surface: {
          DEFAULT: "#FBFBFA",
          subtle: "var(--bg-surface-subtle)",
          hover: "var(--bg-surface-hover)",
          card: "#FFFFFF",
          border: "#EAE9E4",
          muted: "#F4F3EF",
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
        // ── Appointment portal aviation theme ──────────────────────────────
        aviation: {
          DEFAULT: "#062820",
          50: "#f0f5f3",
          100: "#dbe8e4",
          200: "#b8d3cb",
          300: "#8eb6ab",
          400: "#609386",
          500: "#3d7366",
          600: "#2d5a50",
          700: "#22443d",
          800: "#17312c",
          900: "#062820",
          950: "#031713",
        },
        status: {
          scheduled: "#0284c7",
          completed: "#059669",
          declined: "#d97706",
          cancelled: "#e11d48",
          noshow: "#6b7280",
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
