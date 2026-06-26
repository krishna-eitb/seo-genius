'use client'
import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { AnalysisResult, Suggestion } from '@/lib/ai'
import { getImpactColor, getEffortColor, getCategoryIcon, cn } from '@/lib/utils'
import { ChevronDown, Zap } from 'lucide-react'

function SuggestionCard({ s, index }: { s: Suggestion; index: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={cn('suggestion-card glass rounded-xl border transition-all', expanded ? 'border-glow-green/20' : 'border-white/5')}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5"
      >
        <div className="flex items-start gap-4">
          <span className="text-2xl mt-0.5 shrink-0">{getCategoryIcon(s.category)}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-display font-semibold text-white text-sm leading-snug">{s.title}</h3>
              <ChevronDown size={14} className={cn('text-ink-400 shrink-0 transition-transform mt-0.5', expanded && 'rotate-180')} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn('px-2 py-0.5 rounded-full text-xs border font-medium', getImpactColor(s.impact))}>
                {s.impact} impact
              </span>
              <span className={cn('px-2 py-0.5 rounded-full text-xs border font-medium', getEffortColor(s.effort))}>
                {s.effort} effort
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs border border-white/10 text-ink-400 capitalize">
                {s.category}
              </span>
            </div>
          </div>
        </div>

        {s.specificData && (
          <div className="mt-3 ml-10 px-3 py-2 bg-glow-blue/5 border border-glow-blue/15 rounded-lg">
            <p className="text-xs text-glow-blue/80 font-mono">{s.specificData}</p>
          </div>
        )}
      </button>

      {expanded && (
        <div className="px-5 pb-5 ml-10 space-y-4">
          <p className="text-sm text-ink-200 leading-relaxed">{s.description}</p>
          <div>
            <p className="text-xs text-ink-400 font-mono uppercase tracking-wider mb-2">Action Items</p>
            <ol className="space-y-2">
              {s.actionItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-ink-200">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-glow-green/15 border border-glow-green/20 text-glow-green text-xs flex items-center justify-center font-mono font-bold">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}

export function SuggestionsTab({ analysis }: { analysis: AnalysisResult }) {
  const [filter, setFilter] = useState<'all' | 'quick-wins' | 'high'>('all')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.suggestion-card', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' })
    }, ref)
    return () => ctx.revert()
  }, [filter])

  const allSuggestions = analysis.suggestions || []
  const filtered = filter === 'quick-wins'
    ? analysis.quickWins || allSuggestions.filter(s => s.impact === 'high' && s.effort === 'easy')
    : filter === 'high'
    ? allSuggestions.filter(s => s.impact === 'high')
    : allSuggestions

  const quickWins = analysis.quickWins || allSuggestions.filter(s => s.impact === 'high' && s.effort === 'easy')

  return (
    <div ref={ref} className="p-6 space-y-5">
      {/* Quick wins banner */}
      {quickWins.length > 0 && (
        <div className="glass rounded-xl p-4 border border-glow-green/20 bg-glow-green/5">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-glow-green" />
            <span className="text-sm font-semibold text-glow-green">{quickWins.length} Quick Wins Available</span>
          </div>
          <p className="text-xs text-ink-300">High impact, easy effort — start here for fastest results.</p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: `All (${allSuggestions.length})` },
          { id: 'quick-wins', label: `⚡ Quick Wins (${quickWins.length})` },
          { id: 'high', label: `🔥 High Impact (${allSuggestions.filter(s => s.impact === 'high').length})` },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as typeof filter)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              filter === f.id
                ? 'bg-glow-green/15 text-glow-green border border-glow-green/30'
                : 'glass text-ink-300 hover:text-white border border-white/5'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Suggestions list */}
      <div className="space-y-3">
        {filtered.map((s, i) => (
          <SuggestionCard key={s.id || i} s={s} index={i} />
        ))}
        {filtered.length === 0 && (
          <p className="text-center py-10 text-ink-400 text-sm">No suggestions in this category</p>
        )}
      </div>
    </div>
  )
}
