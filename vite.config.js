import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

// Relative asset paths allow deploying the static build in a subdirectory.
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        us: fileURLToPath(new URL('./us/index.html', import.meta.url)),
        kr: fileURLToPath(new URL('./kr/index.html', import.meta.url)),
      },
    },
  },
});
