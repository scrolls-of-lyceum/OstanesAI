import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname, 'src/renderer/devices'), // Set the root directory for Vite
  plugins: [react()], // Add the React plugin for Vite
  build: {
    outDir: resolve(__dirname, 'dist/renderer/devices'), // Specify the output directory
    emptyOutDir: true, // Clear the output directory before each build
    rollupOptions: {
      input: resolve(__dirname, 'src/renderer/devices/index.html'), // Point to your index.html
    },
  },
  server: {
    port: 3000, // Development server port
    open: true, // Automatically open in the browser
  },
});
