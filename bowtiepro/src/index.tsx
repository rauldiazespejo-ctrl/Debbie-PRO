import { Hono } from 'hono'
import auth from './api/auth'
import users from './api/users'

const app = new Hono()

// Mount API routes
app.route('/api/auth', auth)
app.route('/api/users', users)

// Fallback to React app
app.get('*', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Bowtie Studio</title>
        ${
          import.meta.env.PROD
            ? `<link rel="stylesheet" href="/static/assets/style.css">`
            : `<script type="module" src="/src/client.tsx"></script>`
        }
      </head>
      <body>
        <div id="root"></div>
        ${
          import.meta.env.PROD
            ? `<script type="module" src="/static/assets/client.js"></script>`
            : ''
        }
      </body>
    </html>
  `)
})

export default app
