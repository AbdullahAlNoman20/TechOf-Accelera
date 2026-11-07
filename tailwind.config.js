/** Brand palette is taken from the TechOf Solution logo (navy, blue, teal, gold). */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#EEF4FB', 100: '#DCE8F7', 200: '#B9D0EF', 300: '#8DB0E3', 400: '#4F85CF', 500: '#1F63B5', 600: '#1456A8', 700: '#0F4689', 800: '#0B3A7A', 900: '#082B5C', 950: '#061F42' },
        teal: { 50: '#E9F6F7', 100: '#CBEBEE', 200: '#9AD6DC', 300: '#5FBBC5', 400: '#2FA3AF', 500: '#1A8F9B', 600: '#157782', 700: '#105F68', 800: '#0D4A52' },
        gold: { 50: '#FEF8E7', 100: '#FDEFC3', 200: '#FBE08C', 300: '#F8CD5B', 400: '#F6C453', 500: '#F2B632', 600: '#D99A12', 700: '#A87306' },
        ink: { 50: '#F6F8FB', 100: '#EBEFF5', 200: '#D9E0EA', 300: '#BAC5D3', 400: '#8A97A9', 500: '#64748B', 600: '#475569', 700: '#334155', 800: '#1E293B', 900: '#0F172A' },
      },
      boxShadow: { card: '0 1px 2px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.04)' },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'] },
    },
  },
  plugins: [],
};
