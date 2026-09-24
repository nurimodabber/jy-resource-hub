/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          bg: '#f5f5f7',
          surface: '#ffffff',
          border: 'rgba(0, 0, 0, 0.08)',
          subtle: 'rgba(0, 0, 0, 0.04)',
          text: '#1d1d1f',
          secondary: '#86868b',
          tertiary: '#aeaeb2',
          blue: '#0071e3',
          blueHover: '#0077ed',
          green: '#34c759',
          amber: '#ff9500',
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d',
        },
        navy: {
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Helvetica Neue"',
          '"Plus Jakarta Sans"',
          'system-ui',
          'sans-serif',
        ],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'apple-card': '0 2px 12px rgba(0, 0, 0, 0.04)',
        'apple-card-hover': '0 12px 32px rgba(0, 0, 0, 0.08)',
        'apple-pill': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'apple-modal': '0 24px 60px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
