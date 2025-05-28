/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // 支持深色模式
  theme: {
    extend: {
      colors: {
        good: 'var(--color-good)',
        average: 'var(--color-average)',
        poor: 'var(--color-poor)',
      },
      backgroundColor: {
        'dark': 'var(--color-bg-dark)',
        'card-dark': 'var(--color-card-dark)',
      },
      textColor: {
        'dark': 'var(--color-text-dark)',
        'secondary-dark': 'var(--color-text-secondary-dark)',
      },
      borderColor: {
        'dark': 'var(--color-border-dark)',
      }
    },
  },
  plugins: [],
}
