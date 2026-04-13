import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    outDir: 'dist/static/assets',
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, 'src/client.tsx'),
      output: {
        entryFileNames: 'client.js',
        assetFileNames: (info) => {
          if (info.names?.some((n) => n.endsWith('.css'))) return 'style.css'
          return '[name][extname]'
        },
      },
    },
  },
})
