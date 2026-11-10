export default {
  darkMode: "class",
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        verde: {
          DEFAULT: '#4CAF50', // Verde hoja principal
          oscuro: '#2E7D32', // Verde oscuro
        },
        beige: {
          claro: '#F5F5DC',
        },
        marron: {
          tierra: '#8D6E63',
        },
        blanco: {
          puro: '#FFFFFF',
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [],
}
