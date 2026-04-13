import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** Emite el bundle del cliente donde la Build Output API sirve `/static/assets/*`. */
export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    outDir: resolve(__dirname, '.vercel/output/static/static/assets'),
    emptyOutDir: true,
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
