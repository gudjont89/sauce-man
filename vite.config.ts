import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  // host: true exposes the dev server on the LAN for testing on phones
  server: { port: 8080, host: true },
  // Phaser alone is ~1.3 MB minified
  build: { chunkSizeWarningLimit: 2000 },
});
