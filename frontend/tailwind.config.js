/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'brand-dark': '#0f172a',
                'brand-primary': '#6366f1',
                'brand-accent': '#8b5cf6',
            },
        },
    },
    plugins: [],
}
