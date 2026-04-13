import { Hono } from 'hono'

const auth = new Hono()

auth.post('/login', async (c) => {
  const body = await c.req.json<{ email?: string }>().catch(() => ({}))
  return c.json({
    ok: true,
    token: 'demo-session',
    user: {
      id: '1',
      email: body.email ?? 'analista@local',
      name: 'Analista de riesgos',
    },
  })
})

auth.get('/session', (c) =>
  c.json({
    authenticated: true,
    user: { id: '1', name: 'Analista de riesgos', role: 'analista' },
  }),
)

auth.post('/logout', (c) => c.json({ ok: true }))

export default auth
