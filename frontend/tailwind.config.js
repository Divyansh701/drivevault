/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        gold:  { DEFAULT: '#C9A84C', light: '#E2C97E', dark: '#9A7A2E', faint: 'rgba(201,168,76,0.12)' },
        silver:{ DEFAULT: '#A8B2BE', light: '#D0D8E4', dark: '#6B7A8D' },
        brand: { 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 950: '#082f49' },
        surface: {
          50:'#f8fafc', 100:'#f1f5f9', 200:'#e2e8f0', 300:'#cbd5e1',
          400:'#94a3b8', 500:'#64748b', 600:'#475569', 700:'#334155',
          800:'#1e293b', 850:'#172035', 900:'#0f172a', 950:'#020617',
        },
      },
      backgroundImage: {
        'luxury-radial': 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.08), transparent)',
        'hero-gradient': 'linear-gradient(180deg, rgba(2,6,23,0) 0%, rgba(2,6,23,0.7) 50%, #020617 100%)',
        'card-shimmer':  'linear-gradient(105deg, transparent 40%, rgba(201,168,76,0.06) 50%, transparent 60%)',
      },
      boxShadow: {
        'gold-sm':  '0 0 20px rgba(201,168,76,0.15)',
        'gold':     '0 0 40px rgba(201,168,76,0.2)',
        'gold-lg':  '0 0 80px rgba(201,168,76,0.25)',
        'glass':    '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        'card':     '0 20px 60px rgba(0,0,0,0.5)',
      },
      animation: {
        'fade-in':       'fadeIn 0.6s ease-out forwards',
        'fade-in-slow':  'fadeIn 1.2s ease-out forwards',
        'slide-up':      'slideUp 0.6s ease-out forwards',
        'slide-up-slow': 'slideUp 1s ease-out forwards',
        'float':         'float 7s ease-in-out infinite',
        'shimmer':       'shimmer 3s linear infinite',
        'pulse-gold':    'pulseGold 2.5s ease-in-out infinite',
        'border-glow':   'borderGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:      { '0%': { opacity:'0' }, '100%': { opacity:'1' } },
        slideUp:     { '0%': { opacity:'0', transform:'translateY(30px)' }, '100%': { opacity:'1', transform:'translateY(0)' } },
        float:       { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-8px)' } },
        shimmer:     { '0%': { backgroundPosition:'-200% center' }, '100%': { backgroundPosition:'200% center' } },
        pulseGold:   { '0%,100%': { boxShadow:'0 0 20px rgba(201,168,76,0.2)' }, '50%': { boxShadow:'0 0 40px rgba(201,168,76,0.4)' } },
        borderGlow:  { '0%,100%': { borderColor:'rgba(201,168,76,0.3)' }, '50%': { borderColor:'rgba(201,168,76,0.7)' } },
      },
    },
  },
  plugins: [],
};
