// Global Aroma — concept site. Static Astro build; see docs/04-decisions.md.
import { defineConfig } from 'astro/config';

// Preview builds can override the stable Production origin.
const SITE = process.env.PUBLIC_SITE_URL || 'https://global-aroma-claude-concept.vercel.app';

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  compressHTML: true,
  image: { responsiveStyles: false },
  devToolbar: { enabled: false },
});
