import { Hono } from 'hono'

const users = new Hono()

users.get('/me', (c) =>
  c.json({
    id: '1',
    name: 'Analista de riesgos',
    role: 'analista',
    preferences: { locale: 'es', autoSave: true, autoLayoutOnLoad: true },
  }),
)

export default users
