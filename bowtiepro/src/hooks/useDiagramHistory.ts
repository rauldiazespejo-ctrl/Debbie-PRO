import { useCallback, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { Edge, Node } from '@xyflow/react'

type Snap = { nodes: Node[]; edges: Edge[] }

const MAX = 48

export function useDiagramHistory(
  nodes: Node[],
  edges: Edge[],
  setNodes: Dispatch<SetStateAction<Node[]>>,
  setEdges: Dispatch<SetStateAction<Edge[]>>,
) {
  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)
  nodesRef.current = nodes
  edgesRef.current = edges

  const past = useRef<Snap[]>([])
  const future = useRef<Snap[]>([])
  const [, setRev] = useState(0)
  const bump = useCallback(() => setRev((r) => r + 1), [])

  const takeSnapshot = useCallback(() => {
    past.current.push({
      nodes: structuredClone(nodesRef.current),
      edges: structuredClone(edgesRef.current),
    })
    future.current = []
    if (past.current.length > MAX) past.current.shift()
    bump()
  }, [bump])

  const undo = useCallback(() => {
    const snap = past.current.pop()
    if (!snap) return false
    future.current.push({
      nodes: structuredClone(nodesRef.current),
      edges: structuredClone(edgesRef.current),
    })
    setNodes(snap.nodes)
    setEdges(snap.edges)
    bump()
    return true
  }, [setNodes, setEdges, bump])

  const redo = useCallback(() => {
    const snap = future.current.pop()
    if (!snap) return false
    past.current.push({
      nodes: structuredClone(nodesRef.current),
      edges: structuredClone(edgesRef.current),
    })
    setNodes(snap.nodes)
    setEdges(snap.edges)
    bump()
    return true
  }, [setNodes, setEdges, bump])

  return {
    takeSnapshot,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  }
}
