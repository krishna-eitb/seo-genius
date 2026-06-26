'use client'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Download, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function ExportButton() {
  const { gscData, analysis } = useAppStore()
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    if (!gscData || !analysis) return
    setLoading(true)
    toast.loading('Generating PDF…', { id: 'pdf' })
    try {
      const { exportToPDF } = await import('@/lib/pdfExport')
      await exportToPDF(gscData, analysis)
      toast.success('PDF downloaded!', { id: 'pdf' })
    } catch (e) {
      toast.error('PDF export failed', { id: 'pdf' })
    } finally {
      setLoading(false)
    }
  }

  if (!gscData) return null

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg text-xs text-ink-300 hover:text-white border border-white/8 hover:border-white/15 transition-all disabled:opacity-50"
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
      Export PDF
    </button>
  )
}
