export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          indigo: '#3949ab',
          teal: '#0f766e',
          mist: '#eef4ff'
        }
      },
      boxShadow: {
        card: '0 8px 30px rgba(57, 73, 171, 0.12)'
      }
    }
  },
  plugins: []
};
