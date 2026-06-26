'use client'
import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { formatNumber, formatPercent } from '@/lib/utils'
import { Search, TrendingUp, TrendingDown } from 'lucide-react'

interface Query {
  query: string; clicks: number; impressions: number; ctr: number; position: number
}

export function QueriesTab({ queries }: { queries: Query[] }) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<keyof Query>('clicks')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.query-row', { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.02, ease: 'power2.out' })
    }, ref)
    return () => ctx.revert()
  }, [])

  const filtered = queries
    .filter(q => q.query.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const v = sortDir === 'desc' ? b[sortBy] as number - (a[sortBy] as number) : (a[sortBy] as number) - (b[sortBy] as number)
      return v
    })

  const toggleSort = (col: keyof Query) => {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortBy(col); setSortDir('desc') }
  }

  const cols: { key: keyof Query; label: string }[] = [
    { key: 'clicks', label: 'Clicks' },
    { key: 'impressions', label: 'Impressions' },
    { key: 'ctr', label: 'CTR' },
    { key: 'position', label: 'Position' },
  ]

  // Opportunity: high impressions, low CTR
  const opportunities = queries.filter(q => q.impressions > 500 && q.ctr < 3 && q.position <= 10)

  return (
    <div ref={ref} className="p-6 space-y-5">
      {/* Opportunities banner */}
      {opportunities.length > 0 && (
        <div className="glass rounded-xl p-4 border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-2">
            <span>🎯</span>
            <span className="text-sm font-semibold text-amber-400">CTR Opportunities ({opportunities.length} queries)</span>
          </div>
          <p className="text-xs text-ink-300">
            These queries rank on page 1 but have low CTR — rewriting title tags could significantly increase clicks.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {opportunities.slice(0, 5).map(q => (
              <span key={q.query} className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-300 font-mono">
                {q.query}
              </span>
            ))}
            {opportunities.length > 5 && <span className="text-xs text-ink-400">+{opportunities.length - 5} more</span>}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter queries…"
          className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-ink-500 focus:outline-none focus:border-glow-green/30 transition-all"
        />
      </div>

      {/* Table */}
      <div className="glass rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-xs text-ink-400 font-mono uppercase tracking-wider">Query</th>
              {cols.map(c => (
                <th
                  key={c.key}
                  onClick={() => toggleSort(c.key)}
                  className="text-right px-4 py-3 text-xs text-ink-400 font-mono uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none"
                >
                  <span className="flex items-center justify-end gap-1">
                    {c.label}
                    {sortBy === c.key && (sortDir === 'desc' ? <TrendingDown size={10} /> : <TrendingUp size={10} />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map((q, i) => (
              <tr key={q.query} className="query-row border-b border-white/3 hover:bg-white/3 transition-colors">
                <td className="px-4 py-3 text-white font-medium max-w-xs">
                  <span className="mr-2 text-ink-500 font-mono text-xs">{i + 1}</span>
                  <span className="truncate">{q.query}</span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-sm text-white">{formatNumber(q.clicks)}</td>
                <td className="px-4 py-3 text-right font-mono text-sm text-ink-300">{formatNumber(q.impressions)}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`font-mono text-sm ${q.ctr < 2 ? 'text-red-400' : q.ctr < 5 ? 'text-amber-400' : 'text-glow-green'}`}>
                    {formatPercent(q.ctr)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`font-mono text-sm ${q.position <= 3 ? 'text-glow-green' : q.position <= 10 ? 'text-amber-400' : 'text-red-400'}`}>
                    {q.position.toFixed(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-10 text-ink-400 text-sm">No queries found</p>
        )}
      </div>
      <p className="text-xs text-ink-500 text-center">Showing {Math.min(filtered.length, 100)} of {filtered.length} queries</p>
    </div>
  )
}
