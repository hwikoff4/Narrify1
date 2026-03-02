import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig(({ mode }) => {
  const isFullBuild = mode === 'full';

  return {
    plugins: [
      dts({
        insertTypesEntry: true,
      }),
    ],
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'Narrify',
        formats: ['es', 'cjs', 'umd'],
        fileName: (format) => {
          const suffix = isFullBuild ? '.full' : '';
          if (format === 'es') return `narrify.esm${suffix}.js`;
          if (format === 'cjs') return `narrify.cjs${suffix}.js`;
          return `narrify.umd${suffix}.js`;
        },
      },
      rollupOptions: {
        external: isFullBuild ? [] : ['html2canvas'],
        output: {
          globals: isFullBuild ? {} : { 'html2canvas': 'html2canvas' },
        },
      },
      emptyOutDir: !isFullBuild,
      sourcemap: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false,
        },
      },
    },
  };
});
