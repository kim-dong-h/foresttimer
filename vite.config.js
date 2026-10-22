import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { contentRoutes } from './src/siteRoutes.js';

// Relative asset paths allow deploying the static build in a subdirectory.
export default defineConfig({
  base: './',
  build: {
    manifest: true,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        us: fileURLToPath(new URL('./us/index.html', import.meta.url)),
        kr: fileURLToPath(new URL('./kr/index.html', import.meta.url)),
        percent: fileURLToPath(new URL('./percent/index.html', import.meta.url)),
        percentUs: fileURLToPath(new URL('./percent/us/index.html', import.meta.url)),
        cooking: fileURLToPath(new URL('./cooking/index.html', import.meta.url)),
        ...Object.fromEntries(contentRoutes.map(route => [`info_${route.page}_${route.language}`, fileURLToPath(new URL(`.${route.path}index.html`, import.meta.url))])),
      },
    },
  },
});
