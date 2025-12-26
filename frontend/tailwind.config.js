/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'brand-dark': '#000000', // True Black
                'brand-primary': '#00E5FF', // Neon Cyan
                'brand-accent': '#262626',  // Neutral Zinc
                'brand-surface': '#121212', // Zinc 900
                'neon-purple': '#763AF5',   // Unified Purple
                'neon-cyan': '#00E5FF',
            },
            backgroundImage: {
                'shadow-gradient': 'linear-gradient(to right, #763AF5, #A600F5, #00E5FF)',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            }
        },
    },
    plugins: [],
}
