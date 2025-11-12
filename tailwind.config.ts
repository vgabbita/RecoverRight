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
        primary: {
          DEFAULT: '#0047AB',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#228B22',
          foreground: '#FFFFFF',
        },
        tertiary: {
          DEFAULT: '#FFD700',
          foreground: '#212529',
        },
        danger: {
          DEFAULT: '#DC143C',
          foreground: '#FFFFFF',
        },
        background: '#F8F9FA',
        surface: '#FFFFFF',
        'text-primary': '#212529',
        'text-secondary': '#6C757D',
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
