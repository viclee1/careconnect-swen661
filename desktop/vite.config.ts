import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * The renderer build.
 *
 * `base: './'` is the one setting that is not optional: a packaged app loads
 * the renderer over `file://`, where a root-relative `/assets/...` URL resolves
 * to the filesystem root and every script 404s.
 */
export default defineConfig({
  root: 'src/renderer',
  base: './',
  plugins: [react()],
  css: {
    // Pinned empty rather than left to discovery. Without it Vite walks up out
    // of `desktop/` and picks up the web client's PostCSS and Tailwind config
    // at the repository root, which this app does not use.
    postcss: { plugins: [] },
  },
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    port: 5273,
    strictPort: true,
  },
});
