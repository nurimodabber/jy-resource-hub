/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '420px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      'short': { raw: '(max-height: 500px)' },
    },
    extend: {
      borderRadius: {
        lg: '6px',
        xl: '8px',
        '2xl': '10px',
        '3xl': '12px',
      },
      fontSize: {
        '2xs': ['12px', { lineHeight: '16px' }],
        'xs': ['13px', { lineHeight: '18px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '26px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['clamp(1.35rem, 2.5vw, 1.65rem)', { lineHeight: '1.25' }],
        '3xl': ['clamp(1.65rem, 3.5vw, 2.15rem)', { lineHeight: '1.2' }],
        '4xl': ['clamp(2rem, 5vw, 2.75rem)', { lineHeight: '1.15' }],
      },
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'surface-raised': 'var(--surface-raised)',
        text: {
          DEFAULT: 'var(--text)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
        },
        border: {
          DEFAULT: 'var(--border)',
          subtle: 'var(--border-subtle)',
        },
        brand: {
          DEFAULT: 'var(--brand)',
          hover: 'var(--brand-hover)',
        },
        sage: {
          DEFAULT: 'var(--sage)',
          subtle: 'var(--sage-subtle)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          contrast: 'var(--accent-contrast)',
          subtle: 'var(--accent-subtle)',
          text: 'var(--accent-text)',
        },
        // Apple tokens mapped dynamically to CSS variables for backwards compatibility
        apple: {
          bg: 'var(--bg)',
          surface: 'var(--surface)',
          border: 'var(--border)',
          subtle: 'var(--border-subtle)',
          text: 'var(--text)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          blue: 'var(--brand)',
          blueHover: 'var(--brand-hover)',
          green: 'var(--sage)',
          amber: 'var(--accent)',
        },
      },
      fontFamily: {
        sans: [
          '"Figtree"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'sans-serif',
        ],
        serif: ['"Lora"', '"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'apple-card': 'none',
        'apple-card-hover': 'none',
        'apple-pill': 'none',
        'apple-modal': '0 16px 40px -12px rgba(0, 0, 0, 0.28)',
        xs: 'none',
        sm: 'none',
      },
      zIndex: {
        '60': '60',
        '70': '70',
      },
    },
  },
  plugins: [],
}
