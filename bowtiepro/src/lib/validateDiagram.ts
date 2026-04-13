import type { Edge, Node } from '@xyflow/react'

export type DiagramStats = {
  hazards: number
  barriersPreventive: number
  barriersMitigative: number
  topEvents: number
  consequences: number
  edges: number
}

export type DiagramValidation = {
  stats: DiagramStats
  warnings: string[]
  healthScore: number
}

function countType(nodes: Node[], t: string) {
  return nodes.filter((n) => n.type === t).length
}

export function validateDiagram(nodes: Node[], edges: Edge[]): DiagramValidation {
  const stats: DiagramStats = {
    hazards: countType(nodes, 'hazard'),
    barriersPreventive: countType(nodes, 'barrierPreventive'),
    barriersMitigative: countType(nodes, 'barrierMitigative'),
    topEvents: countType(nodes, 'topEvent'),
    consequences: countType(nodes, 'consequence'),
    edges: edges.length,
  }

  const warnings: string[] = []
  const ids = new Set(nodes.map((n) => n.id))
  for (const e of edges) {
    if (!ids.has(e.source) || !ids.has(e.target)) {
      warnings.push('Hay aristas que apuntan a nodos inexistentes.')
      break
    }
  }

  if (stats.topEvents === 0) warnings.push('Falta al menos un evento superior (nudo del bowtie).')
  if (stats.topEvents > 1) warnings.push('Varios eventos superiores: revisa coherencia del escenario.')
  if (stats.hazards === 0) warnings.push('No hay peligros modelados a la izquierda del evento.')
  if (stats.consequences === 0) warnings.push('No hay consecuencias a la derecha del evento.')

  const connected = new Set<string>()
  for (const e of edges) {
    connected.add(e.source)
    connected.add(e.target)
  }
  const isolated = nodes.filter((n) => !connected.has(n.id))
  if (isolated.length > 0) {
    warnings.push(`${isolated.length} nodo(s) sin conexiones (revisa el flujo causal).`)
  }

  let healthScore = 100
  healthScore -= Math.min(40, warnings.length * 12)
  if (stats.barriersPreventive === 0 && stats.hazards > 0) healthScore -= 15
  if (stats.barriersMitigative === 0 && stats.consequences > 0) healthScore -= 15
  healthScore = Math.max(0, Math.min(100, healthScore))

  return { stats, warnings, healthScore }
}
