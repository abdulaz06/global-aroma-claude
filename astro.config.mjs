// Global Aroma — concept site. Static Astro build; see docs/04-decisions.md.
import { defineConfig } from 'astro/config';

// Preview URL is set at deploy time (PUBLIC_SITE_URL); the default keeps
// canonical and Open Graph URLs absolute in local builds.
const SITE = process.env.PUBLIC_SITE_URL || 'https://global-aroma-claude.vercel.app';

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  compressHTML: true,
  image: { responsiveStyles: false },
  devToolbar: { enabled: false },
});
