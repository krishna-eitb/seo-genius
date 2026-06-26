'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { formatNumber } from '@/lib/utils'
import { Clock, BarChart3, Trash2, ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface ReportSummary {
  _id: string
  siteUrl: string
  dateRange: { start: string; end: string }
  analysis: { healthScore: number }
  createdAt: string
}

export default function HistoryPage() {
  const [reports, setReports] = useState<ReportSummary[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/gsc')
      .then(r => r.json())
      .then(d => { setReports(d.reports || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.history-card', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' })
      }, ref)
      return () => ctx.revert()
    }
  }, [loading])

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/gsc/${id}`, { method: 'DELETE' })
      setReports(r => r.filter(x => x._id !== id))
      toast.success('Report deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const scoreColor = (s: number) => s >= 70 ? '#00ff87' : s >= 40 ? '#f59e0b' : '#f87171'

  return (
    <div ref={ref} className="p-6 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white mb-1">Report History</h1>
        <p className="text-ink-400 text-sm">Your past SEO analyses</p>
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-ink-400">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Loading reports…</span>
        </div>
      )}

      {!loading && reports.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center border border-white/5">
          <BarChart3 size={40} className="text-ink-600 mx-auto mb-4" />
          <p className="text-ink-300 font-medium mb-2">No reports yet</p>
          <p className="text-ink-500 text-sm mb-6">Generate your first SEO analysis from the dashboard</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-5 py-2.5 bg-glow-green text-black text-sm font-semibold rounded-xl hover:bg-glow-green/90 transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      )}

      <div className="space-y-3">
        {reports.map(r => (
          <div key={r._id} className="history-card glass rounded-xl p-5 border border-white/5 flex items-center gap-5 group glass-hover transition-all">
            {/* Score */}
            <div className="shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center border border-white/8" style={{ background: `${scoreColor(r.analysis.healthScore)}10` }}>
              <span className="text-xl font-display font-bold" style={{ color: scoreColor(r.analysis.healthScore) }}>
                {r.analysis.healthScore}
              </span>
              <span className="text-xs text-ink-500">score</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm truncate">{r.siteUrl}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-ink-400">
                  <Clock size={10} />
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
                <span className="text-xs text-ink-500">
                  {r.dateRange.start} → {r.dateRange.end}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleDelete(r._id)}
                className="p-2 rounded-lg text-ink-400 hover:text-red-400 hover:bg-red-400/5 transition-all"
                title="Delete report"
              >
                <Trash2 size={13} />
              </button>
              <button
                onClick={() => router.push(`/dashboard?report=${r._id}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-glow-green/10 text-glow-green border border-glow-green/20 rounded-lg text-xs font-medium hover:bg-glow-green/15 transition-all"
              >
                View <ArrowRight size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
