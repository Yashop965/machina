import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'static',
  site: 'https://getmachina.com',
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),
  vite: { build: { assetsInlineLimit: 8192 } },
});
