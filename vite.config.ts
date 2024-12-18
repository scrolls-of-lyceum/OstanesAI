import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname, 'src/renderer/system'), // Set the root directory for Vite
  build: {
    outDir: resolve(__dirname, 'dist/renderer/system'), // Specify the output directory
    emptyOutDir: true, // Clear the output directory before each build
    rollupOptions: {
      input: resolve(__dirname, 'src/renderer/system/index.html'), // Point to your index.html
    },
  },
  server: {
    port: 3000, // Development server port
    open: true, // Automatically open in the browser
  },
});
