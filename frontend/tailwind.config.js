/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
  theme: {
    extend: {
      animation: {
        'breathing': 'breathing 3s ease-in-out infinite',
        'glow-red': 'glow-red 2.5s ease-in-out infinite',
        'glow-gold': 'glow-gold 2.5s ease-in-out infinite',
      },
      keyframes: {
        breathing: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' },
        },
        'glow-red': {
          '0%, 100%': { boxShadow: '0 0 8px 2px rgba(255,0,0,0.6)' },
          '50%': { boxShadow: '0 0 20px 6px rgba(255,0,0,0.9)' },
        },
        'glow-gold': {
          '0%, 100%': { boxShadow: '0 0 10px 3px rgba(255,215,0,0.7)' },
          '50%': { boxShadow: '0 0 30px 10px rgba(255,215,0,1)' },
        },
      },
    },
  },
  plugins: [],
};
