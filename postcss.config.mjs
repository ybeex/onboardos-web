/**
 * Tailwind v4 has no `tailwind.config.ts` by default — configuration
 * (colors, fonts, radii, breakpoints) lives in `src/app/globals.css` via
 * the `@theme` directive instead. This file just wires the PostCSS
 * plugin; see globals.css for the actual design-token source of truth.
 */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
