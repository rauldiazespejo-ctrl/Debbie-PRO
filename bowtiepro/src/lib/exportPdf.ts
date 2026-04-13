import { jsPDF } from 'jspdf'
import { toPng } from 'html-to-image'
import type { DiagramValidation } from './validateDiagram'

/** PDF en A4 apaisado: portada con metadatos y calidad del modelo + página con el diagrama. */
export async function exportBowtiePdf(
  viewportEl: HTMLElement,
  validation: DiagramValidation,
): Promise<void> {
  const dataUrl = await toPng(viewportEl, {
    backgroundColor: '#0e1016',
    pixelRatio: 2,
    cacheBust: true,
  })

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const m = 12

  pdf.setFillColor(12, 10, 16)
  pdf.rect(0, 0, pageW, pageH, 'F')

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.setTextColor(200, 204, 212)
  pdf.text('Bowtie Studio', m, m + 6)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  pdf.setTextColor(200, 200, 210)
  pdf.text('Informe de diagrama bowtie', m, m + 14)

  pdf.setFontSize(9)
  pdf.setTextColor(160, 160, 170)
  const gen = new Date().toLocaleString('es')
  pdf.text(`Generado: ${gen}`, m, m + 22)

  pdf.setTextColor(230, 230, 235)
  pdf.setFontSize(11)
  pdf.text(`Calidad del modelo: ${validation.healthScore} / 100`, m, m + 32)

  pdf.setFontSize(9)
  let y = m + 40
  const line = (t: string) => {
    pdf.text(t, m, y)
    y += 5
  }
  line(
    `Peligros: ${validation.stats.hazards}   Barreras preventivas: ${validation.stats.barriersPreventive}   Mitigadoras: ${validation.stats.barriersMitigative}`,
  )
  line(
    `Eventos superiores: ${validation.stats.topEvents}   Consecuencias: ${validation.stats.consequences}   Aristas: ${validation.stats.edges}`,
  )

  y += 4
  if (validation.warnings.length > 0) {
    pdf.setTextColor(251, 191, 36)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Avisos del modelo', m, y)
    y += 6
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(253, 224, 200)
    for (const w of validation.warnings) {
      const wrapped = pdf.splitTextToSize(`• ${w}`, pageW - 2 * m)
      for (const row of wrapped) {
        if (y > pageH - m) break
        pdf.text(row, m, y)
        y += 4.2
      }
    }
  }

  pdf.addPage('a4', 'landscape')
  pdf.setFillColor(9, 9, 11)
  pdf.rect(0, 0, pageW, pageH, 'F')

  const maxW = pageW - 2 * m
  const maxH = pageH - 2 * m
  const iw = viewportEl.scrollWidth || viewportEl.clientWidth
  const ih = viewportEl.scrollHeight || viewportEl.clientHeight
  const ratio = iw / ih
  let drawW = maxW
  let drawH = drawW / ratio
  if (drawH > maxH) {
    drawH = maxH
    drawW = drawH * ratio
  }
  const x = (pageW - drawW) / 2
  const yImg = (pageH - drawH) / 2
  pdf.addImage(dataUrl, 'PNG', x, yImg, drawW, drawH)

  pdf.save(`bowtie-informe-${new Date().toISOString().slice(0, 10)}.pdf`)
}
