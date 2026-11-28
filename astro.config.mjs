// Global Aroma website (unofficial concept). A fully static site: the catalogue
// is a dated snapshot and the staff demonstration runs in the browser.
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

// Preview builds can override the stable Production origin.
const SITE = process.env.PUBLIC_SITE_URL || 'https://global-aroma-website.vercel.app';

export default defineConfig({
  site: SITE,
  output: 'static',
  integrations: [preact({ include: ['**/staff/**'] })],
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  compressHTML: true,
  image: { responsiveStyles: false },
  devToolbar: { enabled: false },
});
