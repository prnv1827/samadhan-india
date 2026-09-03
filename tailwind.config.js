export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        canvas: '#F8F5EF',
        surface: '#FFFFFF',
        line: '#E3DCCE',
        ink: {
          DEFAULT: '#17201C',
          soft: '#3C4741',
          muted: '#6B7671',
        },
        forest: {
          50: '#EDF4F0',
          100: '#D5E6DD',
          200: '#A9CCBC',
          300: '#74AC95',
          400: '#428A6E',
          500: '#2B6E55',
          600: '#215744',
          700: '#1A4436',
          800: '#123128',
          900: '#0B211B',
        },
        clay: {
          50: '#FBF0E9',
          100: '#F5DCCB',
          200: '#E9B694',
          300: '#DB8B5C',
          400: '#C96A34',
          500: '#B15420',
          600: '#8E4119',
        },
        status: {
          pending: '#946200',
          review: '#1B4FA8',
          assigned: '#5B3AA6',
          progress: '#0F6E62',
          resolved: '#1F7A3D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
      borderRadius: {
        card: '0.625rem',
      },
      boxShadow: {
        raise: '0 1px 2px rgba(23, 32, 28, 0.05), 0 8px 24px -12px rgba(23, 32, 28, 0.18)',
        pop: '0 12px 40px -12px rgba(23, 32, 28, 0.28)',
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
    },
  },
}
