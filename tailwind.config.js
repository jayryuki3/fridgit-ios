/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        fridgit: {
          bg: '#0D1B0F',
          card: '#1A2A1E',
          cardHover: '#243428',
          accent: '#4ADE80',
          accentDim: '#22C55E',
          text: '#F0FDF4',
          textMuted: '#86EFAC',
          textDim: '#6B7280',
          border: '#2D3B30',
          danger: '#EF4444',
          dangerBg: '#3B1111',
          warn: '#F59E0B',
          warnBg: '#3B2F11',
        },
      },
    },
  },
  plugins: [],
};
