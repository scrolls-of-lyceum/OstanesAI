import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve(__dirname, 'src/renderer/system/src'),
      },
    },
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'src/renderer/system/index.html'), // Ensure this points to your renderer's index.html
      },
      outDir: resolve(__dirname, 'out/renderer'), // Specify output directory for renderer build
      emptyOutDir: true,
    },
    plugins: [react()],
  },
});
