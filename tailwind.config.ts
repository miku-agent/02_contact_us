import type { Config } from "tailwindcss";
import daisyui from "daisyui";

const config: Config = {
  content: ["./src/pages/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-outfit)", "ui-sans-serif", "system-ui"],
      },
      letterSpacing: {
        tightish: "-0.02em",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        flat: {
          primary: "#3B82F6",
          secondary: "#10B981",
          accent: "#F59E0B",
          neutral: "#111827",
          "base-100": "#FFFFFF",
          "base-200": "#F3F4F6",
          "base-300": "#E5E7EB",
          info: "#3B82F6",
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
        },
      },
    ],
  },
};

export default config;
