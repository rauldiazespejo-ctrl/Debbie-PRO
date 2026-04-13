import { useEffect, useState } from 'react'
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react'
import { cn } from '../../lib/cn'

function EditableLabel({ id, label }: { id: string; label: string }) {
  const { setNodes } = useReactFlow()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(label)

  useEffect(() => {
    setValue(label)
  }, [label])

  const commit = () => {
    setEditing(false)
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: value } } : n)),
    )
  }

  if (editing) {
    return (
      <textarea
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          e.stopPropagation()
          if (e.key === 'Escape') {
            setEditing(false)
            setValue(label)
          }
        }}
        rows={2}
        className="nodrag nopan mt-1 w-full resize-none rounded-md border border-zinc-600 bg-zinc-950 px-2 py-1 text-sm font-medium leading-snug text-zinc-100 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500/40"
      />
    )
  }

  return (
    <button
      type="button"
      onDoubleClick={(e) => {
        e.stopPropagation()
        setEditing(true)
      }}
      className="nodrag nopan mt-1.5 w-full rounded-md text-left text-sm font-medium leading-snug text-zinc-200 hover:bg-zinc-800/60"
    >
      {label}
    </button>
  )
}

function NodeShell({
  className,
  badge,
  id,
  label,
  target,
  source,
}: {
  className?: string
  badge: string
  id: string
  label: string
  target?: boolean
  source?: boolean
}) {
  return (
    <div
      className={cn(
        'bowtie-node min-w-[168px] max-w-[240px] rounded-lg border border-zinc-700/90 bg-zinc-950/95 px-3.5 py-2.5 shadow-sm ring-1 ring-black/20',
        className,
      )}
    >
      {target && (
        <Handle
          type="target"
          position={Position.Left}
          className="!size-2 !border !border-zinc-500 !bg-zinc-600"
        />
      )}
      {source && (
        <Handle
          type="source"
          position={Position.Right}
          className="!size-2 !border !border-zinc-500 !bg-zinc-600"
        />
      )}
      <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{badge}</p>
      <EditableLabel id={id} label={label} />
    </div>
  )
}

export function HazardNode({ id, data }: NodeProps<{ label: string }>) {
  return (
    <NodeShell
      id={id}
      label={data.label}
      badge="Peligro"
      source
      className="border-l-[3px] border-l-rose-700/90 border-t-zinc-700/90 border-r-zinc-700/90 border-b-zinc-700/90"
    />
  )
}

export function BarrierPreventiveNode({ id, data }: NodeProps<{ label: string }>) {
  return (
    <NodeShell
      id={id}
      label={data.label}
      badge="Barrera preventiva"
      target
      source
      className="border-l-[3px] border-l-amber-700/85 border-t-zinc-700/90 border-r-zinc-700/90 border-b-zinc-700/90"
    />
  )
}

export function TopEventNode({ id, data }: NodeProps<{ label: string }>) {
  return (
    <NodeShell
      id={id}
      label={data.label}
      badge="Evento superior"
      target
      source
      className="border-l-[3px] border-l-slate-400/90 border-t-zinc-600 border-r-zinc-600 border-b-zinc-600 bg-zinc-900/95"
    />
  )
}

export function BarrierMitigativeNode({ id, data }: NodeProps<{ label: string }>) {
  return (
    <NodeShell
      id={id}
      label={data.label}
      badge="Barrera mitigadora"
      target
      source
      className="border-l-[3px] border-l-sky-800/90 border-t-zinc-700/90 border-r-zinc-700/90 border-b-zinc-700/90"
    />
  )
}

export function ConsequenceNode({ id, data }: NodeProps<{ label: string }>) {
  return (
    <NodeShell
      id={id}
      label={data.label}
      badge="Consecuencia"
      target
      className="border-l-[3px] border-l-emerald-800/90 border-t-zinc-700/90 border-r-zinc-700/90 border-b-zinc-700/90"
    />
  )
}
