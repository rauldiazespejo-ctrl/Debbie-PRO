import { useCallback, useEffect, useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { FlowWorkspace } from './components/FlowWorkspace'
import { cn } from './lib/cn'

type SessionUser = { name: string; role: string }

export function App() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2600)
  }, [])

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/session').then((r) => r.json()),
      fetch('/api/users/me').then((r) => r.json()),
    ])
      .then(([s, me]) => {
        if (s?.user) setUser({ name: s.user.name, role: s.user.role ?? me.role ?? 'usuario' })
        else if (me?.name) setUser({ name: me.name, role: me.role })
      })
      .catch(() => setUser(null))
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        showToast('Ya está guardado automáticamente en este navegador')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showToast])

  return (
    <div className="flex min-h-full flex-col bg-[#0b0d11] text-zinc-100">
      <header
        className={cn(
          'flex shrink-0 items-center justify-between border-b border-zinc-800/90 px-5 py-3',
          'bg-[#0f1117]',
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md border border-zinc-600 bg-zinc-900">
            <span className="text-sm font-semibold tracking-tight text-zinc-200">B</span>
          </div>
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight text-zinc-100">Bowtie Studio</h1>
            <p className="text-xs text-zinc-500">
              Modelado de barreras y bowtie para estudios HSE y procesos críticos
            </p>
          </div>
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Pro</p>
          <p className="text-xs text-zinc-600">Validación · Historial · Exportación</p>
        </div>
      </header>

      <main className="flex-1">
        <ReactFlowProvider>
          <FlowWorkspace
            user={user}
            onToast={showToast}
            savedAt={savedAt}
            setSavedAt={setSavedAt}
            shortcutsOpen={shortcutsOpen}
            setShortcutsOpen={setShortcutsOpen}
          />
        </ReactFlowProvider>
      </main>

      <div
        className={cn(
          'pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-all duration-300',
          toast ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
        )}
      >
        {toast && (
          <div className="pointer-events-auto rounded-md border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-sm text-zinc-200 shadow-lg">
            {toast}
          </div>
        )}
      </div>
    </div>
  )
}
