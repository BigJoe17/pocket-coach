/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#f0f4ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1', // Indigo primary
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                },
                slate: {
                    50: '#f8fafc',
                    900: '#0f172a',
                    950: '#020617',
                },
                sage: {
                    50: '#f2f7f2',
                    500: '#84a59d',
                    900: '#354f52',
                }
            },
            fontFamily: {
                sans: ["Inter_400Regular"],
                serif: ["Georgia"], // Or a custom serif if available
            },
            borderRadius: {
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
        },
    },
    plugins: [],
};
