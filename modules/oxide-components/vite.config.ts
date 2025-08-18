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
  build: {
    emptyOutDir: false,
    sourcemap: true,
    outDir: 'lib',
    lib: {
      entry: resolve(__dirname, 'src/main/ts/main.ts'),
      fileName: 'main',
      name: 'oxide-components',
      formats: [ 'es' ],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [ 'react', 'react-dom', 'react-dom/client', 'react/jsx-runtime' ],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
          'react-dom/client': 'ReactDOMClient',
          'react/jsx-runtime': 'ReactJSXRuntime',
        },
      },
    },
  },
  plugins: [ react() ],
});
