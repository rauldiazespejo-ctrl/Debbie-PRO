import type { Edge, Node } from '@xyflow/react'

const KEY = 'bowtie-studio-diagram-v1'

export type StoredDiagram = {
  nodes: Node[]
  edges: Edge[]
  updatedAt: string
}

export function loadDiagram(): StoredDiagram | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredDiagram
  } catch {
    return null
  }
}

export function saveDiagram(nodes: Node[], edges: Edge[]) {
  const payload: StoredDiagram = {
    nodes,
    edges,
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem(KEY, JSON.stringify(payload))
}
