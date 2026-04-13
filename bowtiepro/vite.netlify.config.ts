import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import build from '@hono/vite-build/netlify-functions'

/** Build SSR para Netlify Functions (Node). Emite en netlify/functions/ (no dentro de publish). */
export default defineConfig({
  plugins: [
    build({
      entry: 'src/index.tsx',
      output: 'server/index.js',
      outputDir: './netlify/functions',
      emptyOutDir: true,
    }),
    tailwindcss(),
    react(),
  ],
})
