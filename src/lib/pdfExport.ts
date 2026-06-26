import { GSCData, AnalysisResult } from './ai'
import { formatNumber, formatPercent, scoreToLabel } from './utils'

export async function exportToPDF(gscData: GSCData, analysis: AnalysisResult): Promise<void> {
  // Dynamic import to avoid SSR issues
  const jsPDF = (await import('jspdf')).default

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 20
  let y = margin

  const addPage = () => {
    doc.addPage()
    y = margin
  }

  const checkPageBreak = (needed = 20) => {
    if (y + needed > pageH - margin) addPage()
  }

  // ── Cover ─────────────────────────────────────────────────────────────────
  doc.setFillColor(5, 5, 15)
  doc.rect(0, 0, pageW, pageH, 'F')

  doc.setTextColor(0, 255, 135)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text('SEO Genius', margin, 50)

  doc.setTextColor(200, 200, 220)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'normal')
  doc.text('AI-Powered SEO Intelligence Report', margin, 62)

  doc.setTextColor(100, 100, 160)
  doc.setFontSize(10)
  doc.text(`Site: ${gscData.siteUrl}`, margin, 78)
  doc.text(`Period: ${gscData.dateRange.start} → ${gscData.dateRange.end}`, margin, 86)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 94)

  // Health score circle (text-based)
  const { label: healthLabel, color } = scoreToLabel(analysis.healthScore)
  doc.setTextColor(0, 255, 135)
  doc.setFontSize(48)
  doc.setFont('helvetica', 'bold')
  doc.text(String(analysis.healthScore), pageW - margin - 25, 72, { align: 'right' })
  doc.setFontSize(10)
  doc.text('/ 100 Health Score', pageW - margin, 82, { align: 'right' })
  doc.text(healthLabel, pageW - margin, 90, { align: 'right' })

  addPage()

  // ── Overview Metrics ──────────────────────────────────────────────────────
  doc.setFillColor(10, 10, 30)
  doc.rect(0, 0, pageW, pageH, 'F')

  doc.setTextColor(0, 255, 135)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Performance Overview', margin, y)
  y += 12

  const metrics = [
    { label: 'Total Clicks', value: formatNumber(gscData.overview.totalClicks) },
    { label: 'Total Impressions', value: formatNumber(gscData.overview.totalImpressions) },
    { label: 'Average CTR', value: formatPercent(gscData.overview.avgCTR) },
    { label: 'Average Position', value: gscData.overview.avgPosition.toFixed(1) },
  ]

  metrics.forEach((m, i) => {
    const x = margin + (i % 2) * (pageW / 2 - margin)
    const row = Math.floor(i / 2) * 30
    doc.setFillColor(15, 15, 35)
    doc.roundedRect(x - 2, y + row - 6, pageW / 2 - margin - 4, 26, 2, 2, 'F')
    doc.setTextColor(100, 100, 160)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(m.label.toUpperCase(), x + 3, y + row + 3)
    doc.setTextColor(230, 230, 245)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(m.value, x + 3, y + row + 16)
  })
  y += 72

  // AI Summary
  doc.setTextColor(0, 255, 135)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('AI Summary', margin, y)
  y += 8

  doc.setTextColor(180, 180, 210)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const summaryLines = doc.splitTextToSize(analysis.summary, pageW - margin * 2)
  doc.text(summaryLines, margin, y)
  y += summaryLines.length * 5 + 10

  // Strengths
  checkPageBreak(40)
  doc.setTextColor(0, 200, 100)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Strengths', margin, y)
  y += 7

  analysis.strengths.forEach(s => {
    checkPageBreak(8)
    doc.setTextColor(150, 220, 180)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(`• ${s}`, pageW - margin * 2 - 5)
    doc.text(lines, margin + 3, y)
    y += lines.length * 4.5 + 2
  })
  y += 6

  // Weaknesses
  checkPageBreak(40)
  doc.setTextColor(240, 100, 100)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Areas for Improvement', margin, y)
  y += 7

  analysis.weaknesses.forEach(w => {
    checkPageBreak(8)
    doc.setTextColor(240, 160, 160)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(`• ${w}`, pageW - margin * 2 - 5)
    doc.text(lines, margin + 3, y)
    y += lines.length * 4.5 + 2
  })

  // ── Suggestions ───────────────────────────────────────────────────────────
  addPage()
  doc.setFillColor(10, 10, 30)
  doc.rect(0, 0, pageW, pageH, 'F')

  doc.setTextColor(0, 255, 135)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('AI Recommendations', margin, y)
  y += 12

  analysis.suggestions.forEach((s, i) => {
    checkPageBreak(35)

    doc.setFillColor(15, 15, 35)
    doc.roundedRect(margin - 2, y - 4, pageW - margin * 2 + 4, 30, 2, 2, 'F')

    doc.setTextColor(220, 220, 240)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(`${i + 1}. ${s.title}`, margin + 2, y + 4)

    const impactColors: Record<string, [number, number, number]> = {
      high: [0, 200, 100], medium: [245, 158, 11], low: [100, 150, 255]
    }
    const effortColors: Record<string, [number, number, number]> = {
      easy: [0, 200, 100], medium: [245, 158, 11], hard: [240, 100, 100]
    }

    const ic: [number, number, number] = impactColors[s.impact] ?? [150, 150, 150]
    const ec: [number, number, number] = effortColors[s.effort] ?? [150, 150, 150]

    doc.setTextColor(ic[0], ic[1], ic[2])
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(`↑ ${s.impact} impact`, margin + 2, y + 12)

    doc.setTextColor(ec[0], ec[1], ec[2])
    doc.text(`◆ ${s.effort} effort`, margin + 30, y + 12)

    doc.setTextColor(150, 150, 180)
    const descLines = doc.splitTextToSize(s.description, pageW - margin * 2 - 4)
    const clipped = descLines.slice(0, 2)
    doc.text(clipped, margin + 2, y + 20)

    y += 36
  })

  // ── Top Queries ───────────────────────────────────────────────────────────
  addPage()
  doc.setFillColor(10, 10, 30)
  doc.rect(0, 0, pageW, pageH, 'F')

  doc.setTextColor(0, 255, 135)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Top 20 Queries', margin, y)
  y += 10

  // Table header
  doc.setFillColor(20, 20, 45)
  doc.rect(margin - 2, y - 4, pageW - margin * 2 + 4, 10, 'F')
  doc.setTextColor(100, 100, 160)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('QUERY', margin, y + 3)
  doc.text('CLICKS', pageW - 75, y + 3)
  doc.text('CTR', pageW - 50, y + 3)
  doc.text('POS.', pageW - 25, y + 3)
  y += 12

  gscData.topQueries.slice(0, 20).forEach((q, i) => {
    checkPageBreak(8)
    if (i % 2 === 0) {
      doc.setFillColor(12, 12, 28)
      doc.rect(margin - 2, y - 4, pageW - margin * 2 + 4, 8, 'F')
    }
    doc.setTextColor(180, 180, 210)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const qTrunc = q.query.length > 45 ? q.query.substring(0, 45) + '…' : q.query
    doc.text(qTrunc, margin, y + 1)
    doc.text(formatNumber(q.clicks), pageW - 75, y + 1)
    doc.text(formatPercent(q.ctr), pageW - 50, y + 1)
    doc.text(q.position.toFixed(1), pageW - 25, y + 1)
    y += 8
  })

  // ── Footer on all pages ───────────────────────────────────────────────────
  const pageCount = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFillColor(5, 5, 15)
    doc.rect(0, pageH - 12, pageW, 12, 'F')
    doc.setTextColor(60, 60, 100)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(`SEO Genius — ${gscData.siteUrl}`, margin, pageH - 4)
    doc.text(`Page ${i} of ${pageCount}`, pageW - margin, pageH - 4, { align: 'right' })
  }

  doc.save(`gsc-report-${gscData.siteUrl.replace(/[^a-z0-9]/gi, '-')}-${gscData.dateRange.start}.pdf`)
}
