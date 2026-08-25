/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta "documento oficial": tinta profunda + verde de carimbo + dourado de selo
        ink: {
          50: '#eef1f6',
          100: '#d7deea',
          300: '#8b9bbd',
          500: '#3b4f7a',
          700: '#1f3059',
          900: '#0f1a33',
        },
        stamp: {
          50: '#eaf6f0',
          200: '#a9dcc2',
          400: '#4fae82',
          600: '#237a54',
          700: '#1a5f41',
        },
        seal: {
          400: '#e0b84b',
          500: '#c99a2e',
          600: '#a87c1f',
        },
        paper: '#faf9f5',
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        body: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,26,51,0.06), 0 8px 24px -12px rgba(15,26,51,0.18)',
      },
    },
  },
  plugins: [],
};
