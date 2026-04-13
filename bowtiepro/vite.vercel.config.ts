import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import build from '@hono/vite-build/vercel'

/** Build Output API v3: función Node `__hono` + rutas en `.vercel/output`. */
export default defineConfig({
  plugins: [
    build({
      entry: 'src/index.tsx',
      emptyOutDir: true,
      vercel: {
        name: '__hono',
      },
    }),
    tailwindcss(),
    react(),
  ],
})
