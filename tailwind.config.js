/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './client/app/**/*.{js,ts,jsx,tsx,mdx}',
    './client/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background:         'hsl(var(--background))',
        foreground:         'hsl(var(--foreground))',
        card:               'hsl(var(--card))',
        'card-foreground':  'hsl(var(--card-foreground))',
        popover:            'hsl(var(--popover))',
        'popover-foreground':'hsl(var(--popover-foreground))',
        primary:            'hsl(var(--primary))',
        'primary-foreground':'hsl(var(--primary-foreground))',
        secondary:          'hsl(var(--secondary))',
        'secondary-foreground':'hsl(var(--secondary-foreground))',
        muted:              'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        accent:             'hsl(var(--accent))',
        'accent-foreground':'hsl(var(--accent-foreground))',
        destructive:        'hsl(var(--destructive))',
        'destructive-foreground':'hsl(var(--destructive-foreground))',
        border:             'hsl(var(--border))',
        input:              'hsl(var(--input))',
        ring:               'hsl(var(--ring))',
        // Add any additional --chart-* tokens here if used
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
    },
  },
  plugins: [],
};
