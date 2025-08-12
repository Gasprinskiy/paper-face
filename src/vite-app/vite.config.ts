import { defineConfig } from 'vite';
import type { AliasOptions } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';

// import fs from 'node:fs';

const root = path.resolve(__dirname, 'src');

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': root,
    } as AliasOptions,
  },
});
