import { X } from 'lucide-react'
import { cn } from '../lib/cn'

const rows: [string, string][] = [
  ['Deshacer', 'Ctrl + Z'],
  ['Rehacer', 'Ctrl + Y o Ctrl + Shift + Z'],
  ['Guardar (ya automático)', 'Ctrl + S'],
  ['Eliminar selección', 'Suprimir o Backspace'],
  ['Editar texto de nodo', 'Doble clic en el texto'],
  ['Exportar informe PDF', 'Botón PDF (resumen + diagrama)'],
  ['Atajos', '? o Mayús + /'],
]

export function ShortcutsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        className={cn(
          'max-h-[85vh] w-full max-w-md overflow-auto rounded-md border border-zinc-700 bg-zinc-900 p-6 shadow-lg',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="shortcuts-title" className="text-lg font-semibold text-white">
            Atajos de teclado
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="size-5" />
          </button>
        </div>
        <ul className="space-y-2 text-sm">
          {rows.map(([action, keys]) => (
            <li
              key={action}
              className="flex items-center justify-between gap-4 border-b border-zinc-800/80 py-2 last:border-0"
            >
              <span className="text-zinc-300">{action}</span>
              <kbd className="shrink-0 rounded border border-zinc-600 bg-zinc-950 px-2 py-0.5 font-mono text-[11px] text-zinc-400">
                {keys}
              </kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
