import { defineConfig } from 'vite';

/**
 * The preload bundle.
 *
 * A preload script running with `sandbox: true` gets a cut-down `require` that
 * resolves `electron` and a handful of built-ins and nothing else — a relative
 * import of `../shared/ipc` fails at load time with "module not found", and the
 * only visible symptom is that `window.careconnect` is quietly absent.
 *
 * Bundling it into one self-contained CommonJS file is what lets the preload go
 * on importing the shared IPC contract, so the channel names stay defined in
 * exactly one place, without giving up the sandbox to get it.
 */
export default defineConfig({
  css: { postcss: { plugins: [] } },
  build: {
    outDir: 'dist/main',
    // The main process's own output is already here.
    emptyOutDir: false,
    sourcemap: true,
    // Readable output, because this is the file a security review reads first.
    minify: false,
    lib: {
      entry: 'src/main/preload.ts',
      formats: ['cjs'],
      fileName: () => 'preload.js',
    },
    rollupOptions: {
      external: ['electron', /^node:/],
    },
  },
});
