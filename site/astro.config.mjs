// @ts-check
import { defineConfig } from 'astro/config';
import { siteShikiTheme } from './src/themes/shiki-site-theme.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://salishseawolf.com',
  markdown: {
    shikiConfig: {
      theme: siteShikiTheme,
    },
  },
});
