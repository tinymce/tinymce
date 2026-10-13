import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      'oxide-components': resolve(__dirname, 'src/main/ts'),
    },
  },
  server: {
    open: './src/demo/html/index.html',
  },
  plugins: [ react() ]
});
