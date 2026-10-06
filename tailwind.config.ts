import type { Config } from "tailwindcss";

/**
 * Tailwind is configured to *match* the app's existing design tokens rather
 * than replace them. The colours below are the same palette globals.css has
 * always defined, converted to the HSL triplets shadcn expects — so shadcn
 * components inherit the current look instead of importing a new one.
 *
 * Note the `--ui-` prefix. globals.css already uses `--card`, `--muted`,
 * `--good` and `--warn` for its own hex palette, and shadcn wants those same
 * names as HSL triplets. Rather than rename the existing variables (and touch
 * every un-migrated screen), the shadcn tokens are namespaced. Components
 * still use the normal `bg-card` / `text-muted-foreground` class names; only
 * the variable they resolve to differs.
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    // Match the breakpoints the stylesheet already uses (720px mobile edge,
    // 900px desktop) so migrated and un-migrated screens respond together.
    screens: {
      sm: "480px",
      md: "721px",
      lg: "900px",
    },
    extend: {
      colors: {
        border: "hsl(var(--ui-border))",
        input: "hsl(var(--ui-input))",
        ring: "hsl(var(--ui-ring))",
        background: "hsl(var(--ui-background))",
        foreground: "hsl(var(--ui-foreground))",
        primary: {
          DEFAULT: "hsl(var(--ui-primary))",
          foreground: "hsl(var(--ui-primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--ui-secondary))",
          foreground: "hsl(var(--ui-secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--ui-destructive))",
          foreground: "hsl(var(--ui-destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--ui-muted))",
          foreground: "hsl(var(--ui-muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--ui-accent))",
          foreground: "hsl(var(--ui-accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--ui-popover))",
          foreground: "hsl(var(--ui-popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--ui-card))",
          foreground: "hsl(var(--ui-card-foreground))",
        },
        good: "hsl(var(--ui-good))",
        warn: "hsl(var(--ui-warn))",
      },
      borderRadius: {
        lg: "var(--ui-radius)",
        md: "calc(var(--ui-radius) - 2px)",
        sm: "calc(var(--ui-radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
