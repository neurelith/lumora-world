/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // PRD §8.2 + Brand Kit §4 neutral — paper/ink snapped to exact spec (ponytail: alias parchment=paper, single source)
        parchment: "#F4F2F6", // alias of paper — Brand Kit Paper
        ivory: "#fefefb",
        white: "#ffffff",
        sand: "#f0ede5",
        charcoal: "#3a3835",
        deep: "#1e1d1b",
        ink: "#2B2A33", // PRD Ink — exact
        "ink-secondary": "#6b6863",
        "ink-tertiary": "#9e9a93",
        "ink-quaternary": "#c4c0b8",
        "on-dark": "#f5f3ee",
        terracotta: {
          DEFAULT: "#c96442", // warm, AA on paper; Brand light #E07A5F kept as hover alt in DESIGN.md
          hover: "#b8583a",
          soft: "rgba(201, 100, 66, 0.12)",
          ring: "rgba(201, 100, 66, 0.35)",
        },
        sage: {
          DEFAULT: "#4a7c5e", // accessible on paper; PRD #81B29A is fill-only — see DESIGN.md
          soft: "rgba(74, 124, 94, 0.12)",
        },
        amber: {
          DEFAULT: "#E8A33D", // Brand Kit Amber — exact; was #c48a32 (keep as amber-dark if needed)
          soft: "rgba(232, 163, 61, 0.14)",
        },
        danger: {
          DEFAULT: "#b53333",
          soft: "rgba(181, 51, 51, 0.12)",
        },
        focus: {
          DEFAULT: "#3898ec",
        },
        // ponytail: removed duplicate top-level sage-soft/amber-soft/terracotta-soft — use sage.soft etc.
        whisper: "rgba(45, 43, 40, 0.08)",
        "border-soft": "rgba(45, 43, 40, 0.12)",
        "border-on-dark": "rgba(245, 243, 238, 0.1)",
        forest: {
          DEFAULT: "#3a6b4f",
          light: "#4a8c62",
          dark: "#2d523d",
          soft: "rgba(58, 107, 79, 0.12)",
        },
        castle: {
          DEFAULT: "#4a5a8a",
          light: "#5d6fb0",
          dark: "#384568",
          soft: "rgba(74, 90, 138, 0.12)",
        },
        realm: {
          DEFAULT: "#3a8a82",
          light: "#4aaca3",
          dark: "#2d6b65",
          soft: "rgba(58, 138, 130, 0.12)",
        },
        mountains: {
          DEFAULT: "#5a6b85",
          light: "#6e82a0",
          dark: "#424f62",
          soft: "rgba(90, 107, 133, 0.12)",
        },
        valley: {
          DEFAULT: "#4a7a9a",
          light: "#5d94b8",
          dark: "#3a5d75",
          soft: "rgba(74, 122, 154, 0.12)",
        },
        cream: "#fefefb",
        muted: "#9e9a93",
        hairline: "rgba(45, 43, 40, 0.08)",
        sunshine: "#F2CC8F", // Brand Kit sunshine — light fill, was #c48a32 dark
        paper: "#F4F2F6", // PRD Paper — exact, was #faf8f3
      },
      fontFamily: {
        display: ["var(--font-display)", "Sora", "Helvetica Neue", "Arial", "sans-serif"],
        body: ["Spline Sans", "var(--font-devanagari)", "Noto Sans Devanagari", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      fontSize: {
        "display-hero": ["clamp(3rem, 7vw, 5rem)", { lineHeight: "1.05", letterSpacing: "-0.06em", fontWeight: "600" }],
        "display-secondary": ["clamp(2.25rem, 5vw, 3.5rem)", { lineHeight: "1.10", letterSpacing: "-0.045em", fontWeight: "600" }],
        "section-heading": ["clamp(1.75rem, 4vw, 2.75rem)", { lineHeight: "1.15", letterSpacing: "-0.03em", fontWeight: "600" }],
        "card-title": ["1.375rem", { lineHeight: "1.25", letterSpacing: "-0.015em", fontWeight: "600" }],
        "body-lg": ["1.25rem", { lineHeight: "1.65", fontWeight: "400" }],
        body: ["1.0625rem", { lineHeight: "1.60", fontWeight: "400" }],
        "body-md": ["1.0625rem", { lineHeight: "1.60", fontWeight: "500" }],
        caption: ["0.875rem", { lineHeight: "1.45", letterSpacing: "0.006em", fontWeight: "400" }],
        badge: ["0.75rem", { lineHeight: "1.35", letterSpacing: "0.01em", fontWeight: "500" }],
        micro: ["0.6875rem", { lineHeight: "1.35", letterSpacing: "0.015em", fontWeight: "500" }],
      },
      borderRadius: {
        chip: "4px",
        button: "8px",
        card: "12px",
        panel: "16px",
        hero: "24px",
        pill: "9999px",
      },
      boxShadow: {
        ring: "0 0 0 1px rgba(45, 43, 40, 0.08)",
        "ring-terracotta": "0 0 0 1px rgba(201, 100, 66, 0.35)",
        "ring-sage": "0 0 0 1px rgba(74, 124, 94, 0.35)",
        "ring-focus": "0 0 0 3px #3898ec",
        sm: "0 1px 2px rgba(45, 43, 40, 0.04)",
        card: "0 4px 18px rgba(45, 43, 40, 0.04), 0 2px 8px rgba(45, 43, 40, 0.025), 0 1px 3px rgba(45, 43, 40, 0.02)",
        float: "0 16px 32px rgba(45, 43, 40, 0.08), 0 8px 16px rgba(45, 43, 40, 0.05)",
        deep: "0 24px 48px rgba(45, 43, 40, 0.1), 0 12px 24px rgba(45, 43, 40, 0.06), inset 0 1px 0 rgba(255,255,255,0.04)",
        "soft-sm": "0 2px 8px -2px rgba(43, 42, 51, 0.05)",
        "soft-md": "0 6px 18px -3px rgba(43, 42, 51, 0.08)",
        "soft-lg": "0 12px 32px -4px rgba(43, 42, 51, 0.12)",
        "amber-glow": "0 8px 24px -4px rgba(232, 163, 61, 0.35)",
        "sage-glow": "0 8px 24px -4px rgba(129, 178, 154, 0.35)",
      },
      animation: {
        "cascade-in": "cascadeIn 0.5s var(--ease-out-expo) forwards",
        "spring-in": "springIn 0.6s var(--ease-spring) forwards",
        "fade-in": "fadeIn 0.3s var(--ease-out-expo) forwards",
        "slide-up": "slideUp 0.4s var(--ease-out-expo) forwards",
        "slide-down": "slideDown 0.4s var(--ease-out-expo) forwards",
        "scale-in": "scaleIn 0.3s var(--ease-spring) forwards",
        "pulse-gentle": "pulseGentle 2.5s ease-in-out infinite",
        "bounce-gentle": "bounceGentle 1.5s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        shimmer: "shimmer 2s ease-in-out infinite",
        "float-gentle": "float 3s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        cascadeIn: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        springIn: {
          "0%": { opacity: "0", transform: "scale(0.96) translateY(8px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseGentle: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.03)" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        glow: {
          "0%": { filter: "drop-shadow(0 0 4px rgba(232, 163, 61, 0.4))" },
          "100%": { filter: "drop-shadow(0 0 16px rgba(232, 163, 61, 0.8))" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
        "ease-out-expo": "cubic-bezier(0, 0, 0.2, 1)",
      },
      transitionDuration: {
        fast: "120ms",
        base: "200ms",
        slow: "350ms",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        shimmer: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
      },
    },
  },
  plugins: [],
};
