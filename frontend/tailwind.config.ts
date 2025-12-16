import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "hsl(var(--background))",
                surface: {
                    DEFAULT: "hsl(var(--surface))",
                    highlight: "hsl(var(--surface-highlight))",
                },
                foreground: {
                    DEFAULT: "hsl(var(--foreground))",
                    muted: "hsl(var(--foreground-muted))",
                    dim: "hsl(var(--foreground-dim))",
                },
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    hover: "hsl(var(--primary-hover))",
                },
                // Semantic Roles
                safe: "hsl(var(--safe))",
                warning: "hsl(var(--warning))",
                critical: "hsl(var(--critical))",
                info: "hsl(var(--info))",
                border: "hsl(var(--border))",
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui'],
                mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'ui-monospace', 'SFMono-Regular'],
            },
            backgroundImage: {
                'grid-pattern': "linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)",
                'vignette': "radial-gradient(circle, transparent 50%, rgba(2,6,23,0.8) 100%)",
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'stripe-flow': 'stripe-flow 20s linear infinite',
            },
            keyframes: {
                'stripe-flow': {
                    '0%': { backgroundPosition: '0 0' },
                    '100%': { backgroundPosition: '100% 100%' },
                }
            }
        },
    },
    plugins: [],
};
export default config;
