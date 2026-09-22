import { defineConfig } from 'astro/config';
export default defineConfig({
  output: 'static',
  site: 'https://getmachina.com',
  vite: { build: { assetsInlineLimit: 8192 } },
});
