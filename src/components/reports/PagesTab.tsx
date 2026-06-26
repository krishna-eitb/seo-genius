'use client'
import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { formatNumber, formatPercent, truncateUrl } from '@/lib/utils'
import { Search, ExternalLink } from 'lucide-react'

interface Page {
  page: string; clicks: number; impressions: number; ctr: number; position: number
}

export function PagesTab({ pages }: { pages: Page[] }) {
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.page-row', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.02, ease: 'power2.out' })
    }, ref)
    return () => ctx.revert()
  }, [])

  const filtered = pages.filter(p => p.page.toLowerCase().includes(search.toLowerCase()))
  const maxClicks = Math.max(...pages.map(p => p.clicks), 1)

  return (
    <div ref={ref} className="p-6 space-y-5">
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter pages…"
          className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-ink-500 focus:outline-none focus:border-glow-green/30 transition-all"
        />
      </div>

      <div className="space-y-2">
        {filtered.slice(0, 50).map((p, i) => (
          <div key={p.page} className="page-row glass rounded-xl p-4 border border-white/5 glass-hover transition-all">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-mono text-ink-500 shrink-0">{i + 1}.</span>
                <a
                  href={p.page.startsWith('http') ? p.page : `https://${p.page}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-sm text-glow-blue hover:text-white transition-colors truncate flex items-center gap-1"
                >
                  {truncateUrl(p.page, 70)}
                  <ExternalLink size={10} className="shrink-0 opacity-50" />
                </a>
              </div>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-4 gap-3">
              <div>
                <p className="text-xs text-ink-400 mb-1">Clicks</p>
                <p className="text-sm font-mono font-semibold text-white">{formatNumber(p.clicks)}</p>
                <div className="mt-1.5 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-glow-green rounded-full transition-all"
                    style={{ width: `${(p.clicks / maxClicks) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <p className="text-xs text-ink-400 mb-1">Impressions</p>
                <p className="text-sm font-mono font-semibold text-ink-200">{formatNumber(p.impressions)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-400 mb-1">CTR</p>
                <p className={`text-sm font-mono font-semibold ${p.ctr < 2 ? 'text-red-400' : p.ctr < 5 ? 'text-amber-400' : 'text-glow-green'}`}>
                  {formatPercent(p.ctr)}
                </p>
              </div>
              <div>
                <p className="text-xs text-ink-400 mb-1">Position</p>
                <p className={`text-sm font-mono font-semibold ${p.position <= 3 ? 'text-glow-green' : p.position <= 10 ? 'text-amber-400' : 'text-red-400'}`}>
                  {p.position.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center py-10 text-ink-400 text-sm">No pages found</p>
      )}
    </div>
  )
}
