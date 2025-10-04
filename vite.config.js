// vite.config.js
import { defineConfig } from 'vite'
import { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    outDir: 'docs',
    emptyOutDir: true, // Clean the output directory before building
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        archive: resolve(__dirname, 'archive.html'),
        freebulder: resolve(__dirname, 'freebulder.html'),
        freebuilder: resolve(__dirname, 'freebuilder.html'),
        sentence: resolve(__dirname, 'sentence_generator.html'),
        svg: resolve(__dirname, 'svg.html'),
        word: resolve(__dirname, 'word_generator.html'),
      },
    },
  },
  publicDir: 'public', // Ensure public files are copied (includes CNAME)
})
