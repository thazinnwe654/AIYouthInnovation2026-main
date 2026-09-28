import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: path.resolve(here, '..'),
  plugins: [react()],
  resolve: {
    alias: [
      { find: '../api/judges', replacement: path.resolve(here, 'mock-judges.js') },
      { find: '../api/deliverables', replacement: path.resolve(here, 'mock-deliverables.js') },
    ],
  },
  ssr: { noExternal: true },
  esbuild: { target: 'esnext' },
  build: {
    ssr: path.resolve(here, 'entry.jsx'),
    outDir: path.resolve(here, 'out'),
    emptyOutDir: true,
    minify: false,
    target: 'esnext',
    rollupOptions: {
      external: ['jsdom'],
      output: { format: 'cjs', entryFileNames: 'entry.cjs' },
    },
  },
})
