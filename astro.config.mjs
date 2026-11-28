// Global Aroma — concept site. Static pages plus a few on-demand endpoints
// (catalogue refresh, staff connector). See docs/04-decisions.md D17–D20.
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel';

// Preview builds can override the stable Production origin.
const SITE = process.env.PUBLIC_SITE_URL || 'https://global-aroma-claude-concept.vercel.app';
// Vercel sets VERCEL=1 during its builds; everywhere else a Node server serves preview and tests.
const onVercel = !!process.env.VERCEL;

export default defineConfig({
  site: SITE,
  output: 'static',
  adapter: onVercel ? vercel() : node({ mode: 'standalone' }),
  integrations: [preact({ include: ['**/staff/**'] })],
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  compressHTML: true,
  image: { responsiveStyles: false },
  devToolbar: { enabled: false },
  security: { checkOrigin: true },
});
