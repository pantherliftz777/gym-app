/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./views/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./main.tsx",
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-card': 'var(--surface-card)',
        'surface-hover': 'var(--surface-hover)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        accent: 'var(--accent)',
        'accent-glow': 'var(--accent-glow)',
        'accent-soft': 'var(--accent-soft)',
        'on-accent': 'var(--on-accent)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        protein: 'var(--protein)',
        carbs: 'var(--carbs)',
        fat: 'var(--fat)',
        warn: 'var(--warn)',
        danger: 'var(--danger)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Syne', 'sans-serif'],
        body: ['var(--font-body)', 'Outfit', 'sans-serif'],
        mono: ['var(--font-mono)', 'Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        card: 'var(--radius-card)',
        pill: 'var(--radius-pill)',
      },
      transitionTimingFunction: {
        spring: 'var(--ease-spring)',
        smooth: 'var(--ease-smooth)',
      },
      transitionDuration: {
        fast: 'var(--dur-fast)',
        normal: 'var(--dur-normal)',
        slow: 'var(--dur-slow)',
      },
    },
  },
  plugins: [],
};
