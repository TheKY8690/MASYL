import react from '@vitejs/plugin-react';
import aitDevtools from '@apps-in-toss/devtools/unplugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [aitDevtools.vite(), react({ jsxImportSource: '@emotion/react' })],
  server: {
    port: 5180,
    host: true,
  },
  build: {
    outDir: 'dist',
  },
});
