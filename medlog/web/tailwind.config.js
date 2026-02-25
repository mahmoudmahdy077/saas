/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: '#4d66eb',
          50: '#edf0fd',
          100: '#dbe0fa',
          200: '#b8c2f5',
          300: '#95a3ef',
          400: '#7185ea',
          500: '#4d66eb',
          600: '#3e52bc',
          700: '#2e3d8d',
          800: '#1f295e',
          900: '#0f142f',
          950: '#080a18',
        },
        secondary: {
          DEFAULT: '#ffd66b',
          50: '#fffbf0',
          100: '#fff8e1',
          200: '#fff0c3',
          300: '#ffe9a5',
          400: '#ffe188',
          500: '#ffd66b',
          600: '#ccab56',
          700: '#998040',
          800: '#66562b',
          900: '#332b15',
          950: '#1a150b',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
