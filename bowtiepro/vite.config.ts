import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import devServer from '@hono/vite-dev-server'
import tailwindcss from '@tailwindcss/vite'
import build from '@hono/vite-build/cloudflare-pages'

export default defineConfig({
  plugins: [
    build(),
    tailwindcss(),
    react(),
    devServer({
      entry: 'src/index.tsx',
      exclude: [
        /.*\.tsx?($|\?)/,
        /.*\.(s?css|less)($|\?)/,
        /.*\.(svg|png)($|\?)/,
        /^\/@.+$/,
        /^\/favicon\.ico$/,
        /^\/(public|assets|static)\/.+/,
        /^\/node_modules\/.*/,
      ],
      injectClientScript: false,
    }),
  ],
})
