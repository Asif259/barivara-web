import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          emerald: '#12664F',
          teal: '#307473',
          cyan: '#2DC2BD',
          ice: '#C6D4FF',
          paper: '#FAFAF9',
          ink: '#0A1118',
        },
      },
      fontFamily: {
        // Bangla font sits in the sans stack so mixed-script text never breaks.
        sans: ['var(--font-inter)', 'var(--font-hind)', 'system-ui', 'sans-serif'],
        bangla: ['var(--font-hind)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgb(10 17 24 / 0.04), 0 10px 30px -12px rgb(10 17 24 / 0.18)',
      },
      maxWidth: { '8xl': '88rem' },
    },
  },
  plugins: [],
}

export default config