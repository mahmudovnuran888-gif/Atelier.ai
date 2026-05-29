import { defineConfig } from 'vite';

// Vanilla JS project — no framework plugins required.
export default defineConfig({
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
});
