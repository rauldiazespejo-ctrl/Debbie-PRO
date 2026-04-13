import type { Node } from '@xyflow/react'

export type StudioNodeType =
  | 'hazard'
  | 'barrierPreventive'
  | 'topEvent'
  | 'barrierMitigative'
  | 'consequence'

const defaultLabels: Record<StudioNodeType, string> = {
  hazard: 'Nuevo peligro',
  barrierPreventive: 'Barrera preventiva',
  topEvent: 'Evento superior',
  barrierMitigative: 'Barrera mitigadora',
  consequence: 'Consecuencia',
}

export function newNodeId(prefix: string) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.().slice(0, 8) ?? String(Date.now())}`
}

export function createStudioNode(type: StudioNodeType, position: { x: number; y: number }): Node {
  const id = newNodeId(type.slice(0, 2))
  return {
    id,
    type,
    position,
    data: { label: defaultLabels[type] },
  }
}
