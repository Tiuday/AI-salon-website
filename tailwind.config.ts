import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  // ── Font families reference CSS vars injected by next/font ──
  theme: {
    fontFamily: {
      display: ['var(--font-display)', 'Georgia', 'serif'],
      sans:    ['var(--font-sans)', 'system-ui', 'sans-serif'],
      impact:  ['var(--font-impact)', 'Impact', 'sans-serif'],
      mono:    ['var(--font-mono)', 'Consolas', 'monospace'],
    },

    extend: {
      // ── Color System ──────────────────────────────────────────
      colors: {
        // Background layers (dark → light)
        ink:      '#080808',  // page background
        carbon:   '#111111',  // alternate sections
        obsidian: '#181818',  // card backgrounds
        ash:      '#222222',  // elevated surfaces (dropdowns, popovers)
        wire:     '#2C2C2C',  // borders, dividers
        smoke:    '#404040',  // disabled states, subtle elements

        // Text layers (bright → faint)
        chalk:  '#F0EBE3',  // primary text (warm cream)
        pearl:  '#C8C0B5',  // secondary text
        mist:   '#8A8278',  // tertiary / placeholder text
        dim:    '#5A5650',  // disabled text

        // Gold — primary luxury accent
        gold: {
          DEFAULT: '#C9A96E',
          light:   '#E2C28E',  // hover
          dark:    '#A68848',  // pressed / active
          subtle:  'rgba(201, 169, 110, 0.10)',
          glow:    'rgba(201, 169, 110, 0.22)',
        },

        // Ember — bold red for manifesto / impact moments
        ember: {
          DEFAULT: '#C8391A',
          light:   '#E04B2A',  // hover
          dark:    '#A02E14',  // pressed
          subtle:  'rgba(200, 57, 26, 0.10)',
        },

        // Status
        success: '#4A7C59',
        error:   '#9B2C2C',
        warning: '#8A6320',
      },

      // ── Fluid Type Scale ──────────────────────────────────────
      // clamp(min, preferred, max) — mobile-first fluid type
      fontSize: {
        'display-2xl': ['clamp(3.5rem, 8.5vw, 9.5rem)', { lineHeight: '0.88', letterSpacing: '-0.035em', fontWeight: '400' }],
        'display-xl':  ['clamp(2.75rem, 6vw,  6.5rem)', { lineHeight: '0.92', letterSpacing: '-0.03em',  fontWeight: '400' }],
        'display-lg':  ['clamp(2rem,    4.5vw, 4.5rem)', { lineHeight: '0.96', letterSpacing: '-0.025em', fontWeight: '400' }],
        'display-md':  ['clamp(1.625rem,3vw,   3rem)',   { lineHeight: '1.05', letterSpacing: '-0.018em', fontWeight: '400' }],
        'heading-xl':  ['clamp(1.25rem, 2vw,   1.875rem)',{ lineHeight: '1.2', letterSpacing: '-0.012em', fontWeight: '400' }],
        'heading-lg':  ['1.375rem', { lineHeight: '1.3',  letterSpacing: '-0.01em' }],
        'heading-md':  ['1.125rem', { lineHeight: '1.4',  letterSpacing: '-0.005em' }],
        'body-lg':     ['1.125rem', { lineHeight: '1.65', letterSpacing: '0.003em' }],
        'body-md':     ['1rem',     { lineHeight: '1.7',  letterSpacing: '0.008em' }],
        'body-sm':     ['0.875rem', { lineHeight: '1.65', letterSpacing: '0.012em' }],
        'caption':     ['0.75rem',  { lineHeight: '1.5',  letterSpacing: '0.04em'  }],
        'overline':    ['0.6875rem',{ lineHeight: '1',    letterSpacing: '0.14em'  }],
      },

      // ── Spacing (8px base) ────────────────────────────────────
      spacing: {
        '4.5':  '1.125rem',
        '5.5':  '1.375rem',
        '7.5':  '1.875rem',
        '13':   '3.25rem',
        '15':   '3.75rem',
        '18':   '4.5rem',
        '22':   '5.5rem',
        '26':   '6.5rem',
        '30':   '7.5rem',
        '34':   '8.5rem',
        '38':   '9.5rem',
        '42':   '10.5rem',
        '50':   '12.5rem',
        '68':   '17rem',
        '76':   '19rem',
        '88':   '22rem',
        '100':  '25rem',
        '108':  '27rem',
        '120':  '30rem',
        '128':  '32rem',
        '140':  '35rem',
        '160':  '40rem',
        '192':  '48rem',
      },

      // ── Border Radius ─────────────────────────────────────────
      borderRadius: {
        DEFAULT: '3px',
        sm:  '2px',
        md:  '6px',
        lg:  '12px',
        xl:  '20px',
        '2xl': '32px',
        '3xl': '48px',
      },

      // ── Shadows ───────────────────────────────────────────────
      // Luxury = deep, dark, layered
      boxShadow: {
        'card':         '0 1px 2px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4)',
        'card-hover':   '0 2px 4px rgba(0,0,0,0.7), 0 20px 60px rgba(0,0,0,0.6)',
        'elevated':     '0 4px 8px rgba(0,0,0,0.7), 0 32px 80px rgba(0,0,0,0.8)',
        'gold':         '0 0 0 1px rgba(201,169,110,0.25), 0 0 28px rgba(201,169,110,0.12)',
        'gold-strong':  '0 0 0 1px rgba(201,169,110,0.45), 0 0 52px rgba(201,169,110,0.22)',
        'gold-glow':    '0 0 80px rgba(201,169,110,0.18), 0 0 160px rgba(201,169,110,0.08)',
        'ember':        '0 0 0 1px rgba(200,57,26,0.3), 0 0 24px rgba(200,57,26,0.14)',
        'inset-wire':   'inset 0 0 0 1px #2C2C2C',
        'inset-gold':   'inset 0 0 0 1px rgba(201,169,110,0.3)',
        'none':         'none',
      },

      // ── Background Images / Gradients ─────────────────────────
      backgroundImage: {
        'gradient-ink':         'linear-gradient(180deg, #080808 0%, #111111 100%)',
        'gradient-ink-up':      'linear-gradient(0deg, #080808 0%, #111111 100%)',
        'gradient-gold':        'linear-gradient(135deg, #C9A96E 0%, #E2C28E 50%, #A68848 100%)',
        'gradient-gold-subtle': 'linear-gradient(135deg, rgba(201,169,110,0.14) 0%, rgba(201,169,110,0.04) 100%)',
        'gradient-hero-fade':   'linear-gradient(180deg, rgba(8,8,8,0) 0%, rgba(8,8,8,0.35) 40%, rgba(8,8,8,0.92) 100%)',
        'gradient-radial-gold': 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(201,169,110,0.14) 0%, transparent 100%)',
        'gradient-card-edge':   'linear-gradient(135deg, rgba(201,169,110,0.06) 0%, transparent 60%)',
        'shimmer':              'linear-gradient(90deg, transparent 0%, rgba(201,169,110,0.08) 50%, transparent 100%)',
      },

      // ── Animations ────────────────────────────────────────────
      animation: {
        'fade-in':      'fade-in 0.4s ease-out both',
        'fade-up':      'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-down':    'fade-down 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in':     'scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-left':   'slide-left 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-right':  'slide-right 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'gold-pulse':   'gold-pulse 2.8s ease-in-out infinite',
        'shimmer':      'shimmer 2.2s linear infinite',
        'waveform':     'waveform 1.4s ease-in-out infinite alternate',
        'spin-slow':    'spin 3s linear infinite',
        'cursor-blink': 'cursor-blink 1.1s step-end infinite',
      },

      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(28px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-down': {
          from: { opacity: '0', transform: 'translateY(-28px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.93)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'slide-left': {
          from: { opacity: '0', transform: 'translateX(36px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-right': {
          from: { opacity: '0', transform: 'translateX(-36px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'gold-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201,169,110,0)' },
          '50%':      { boxShadow: '0 0 28px 6px rgba(201,169,110,0.18)' },
        },
        'shimmer': {
          from: { backgroundPosition: '-200% 0' },
          to:   { backgroundPosition: '200% 0' },
        },
        'waveform': {
          from: { transform: 'scaleY(0.2)' },
          to:   { transform: 'scaleY(1)' },
        },
        'cursor-blink': {
          'from, to': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
      },

      // ── Easing Curves ─────────────────────────────────────────
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.16, 1, 0.3, 1)',   // smooth decelerate (most UI)
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)', // slight overshoot (interactive)
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',     // material standard
        'snappy': 'cubic-bezier(0.2, 0, 0, 1)',        // fast out, slow decelerate
      },

      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1000': '1000ms',
        '1200': '1200ms',
      },

      // ── Breakpoints ───────────────────────────────────────────
      screens: {
        xs:  '375px',
        sm:  '640px',
        md:  '768px',
        lg:  '1024px',
        xl:  '1280px',
        '2xl': '1440px',
        '3xl': '1920px',
      },

      maxWidth: {
        'content':  '1200px',  // standard content
        'editorial':'1440px',  // full editorial/hero
        'readable': '68ch',    // optimal reading width
        'narrow':   '48ch',    // captions, labels
      },

      // ── Z-index ───────────────────────────────────────────────
      zIndex: {
        'base':     '0',
        'raised':   '10',
        'dropdown': '100',
        'sticky':   '200',
        'overlay':  '300',
        'modal':    '400',
        'toast':    '500',
      },
    },
  },
  plugins: [],
}

export default config
