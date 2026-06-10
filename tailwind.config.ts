import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ClientSpace color system — maps to CSS variables
        cs: {
          bg: "var(--cs-bg)",
          surface: "var(--cs-surface)",
          s2: "var(--cs-s2)",
          s3: "var(--cs-s3)",
          bd: "var(--cs-bd)",
          bdh: "var(--cs-bdh)",
          ink: "var(--cs-ink)",
          ink2: "var(--cs-ink2)",
          ink3: "var(--cs-ink3)",
          mu: "var(--cs-mu)",
          ac: "var(--cs-ac)",
          acl: "var(--cs-acl)",
          acm: "var(--cs-acm)",
          sb: "var(--cs-sb)",
          error: "var(--cs-error)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        ui: ["var(--font-ui)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display": ["52px", { lineHeight: "1.05", letterSpacing: "-0.015em" }],
        "h1": ["26px", { lineHeight: "1.25", letterSpacing: "-0.02em" }],
        "h2": ["18px", { lineHeight: "1.3", letterSpacing: "-0.015em" }],
        "h3": ["15px", { lineHeight: "1.4" }],
        "body-lg": ["15px", { lineHeight: "1.7" }],
        "body": ["14px", { lineHeight: "1.7" }],
        "caption": ["12px", { lineHeight: "1.5" }],
        "label": ["11px", { lineHeight: "1", letterSpacing: "0.07em" }],
        "xs": ["11px", { lineHeight: "1" }],
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "10px",
        full: "99px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0, 0, 0, 0.04)",
        md: "0 2px 10px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)",
        lg: "0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)",
        xl: "0 4px 24px rgba(0, 0, 0, 0.10), 0 1px 4px rgba(0, 0, 0, 0.06)",
      },
      spacing: {
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "7": "28px",
        "8": "32px",
        "9": "36px",
        "10": "40px",
        "11": "44px",
        "12": "48px",
        "14": "56px",
        "16": "64px",
        "18": "72px",
        "20": "80px",
        "24": "96px",
        "32": "128px",
        "40": "160px",
        "48": "192px",
        "sidebar": "188px",
      },
      transitionDuration: {
        "micro": "120ms",
        "fast": "150ms",
        "normal": "200ms",
        "slow": "250ms",
      },
      transitionTimingFunction: {
        "smooth": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      maxWidth: {
        "content": "1160px",
        "portal": "680px",
        "prose": "68ch",
      },
    },
  },
  plugins: [],
};

export default config;
