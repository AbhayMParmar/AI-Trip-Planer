/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                olive: {
                    50: '#f0f4e8',
                    100: '#e1e9d1',
                    200: '#c3d3a3',
                    300: '#a5bd75',
                    400: '#87a747',
                    500: '#556B2F', // Primary Olive
                    600: '#455726',
                    700: '#34411d',
                    800: '#232c13',
                    900: '#11160a',
                },
                black: '#000000',
                white: '#ffffff',
            },
            fontFamily: {
                outfit: ['Outfit', 'sans-serif'],
                jakarta: ['Plus Jakarta Sans', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            boxShadow: {
                '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
                'premium': '0 32px 64px -16px rgba(0, 0, 0, 0.1)',
            },
        },
    },
    plugins: [],
}