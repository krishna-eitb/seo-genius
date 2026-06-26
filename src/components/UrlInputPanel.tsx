'use client'
import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { gsap } from 'gsap'
import { useAppStore } from '@/lib/store'
import { Search, Globe, ChevronDown, Loader2, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export function UrlInputPanel() {
  const { data: session } = useSession()
  const { setReport, setLoadingReport, setReportError, setSites, setSitesLoading, sites } = useAppStore()
  const [url, setUrl] = useState('')
  const [days, setDays] = useState(28)
  const [showSites, setShowSites] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const [isCustom, setIsCustom] = useState(false);
  const [customRange, setCustomRange] = useState({
    from: '',
    to: ''
  });

  // Load site list on mount
  useEffect(() => {
    if (!session?.accessToken) return
    setSitesLoading(true)
    fetch('/api/gsc?listSites=1')
      .then(r => r.json())
      .then(data => {
        setSites(data.sites || [])
        setSitesLoading(false)
      })
      .catch(() => setSitesLoading(false))
  }, [session])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(panelRef.current, { opacity: 0, scale: 0.95, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'power3.out' })
    })
    return () => ctx.revert()
  }, [])

  const handleAnalyze = async () => {
    if (!url.trim()) { toast.error('Please enter a website URL'); return }
    const siteUrl = url.startsWith('http') 
    ? url : `sc-domain:${url}`

    setIsLoading(true)
    setLoadingReport(true)
    toast.loading('Fetching GSC data…', { id: 'gsc-fetch' })

    try {
      const res = await fetch('/api/gsc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteUrl, days }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to fetch data')

      toast.success('Analysis complete!', { id: 'gsc-fetch' })
      setReport(data.reportId, data.gscData, data.analysis)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(msg, { id: 'gsc-fetch' })
      setReportError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const dayOptions = [7, 14, 28, 90]

  let fromDate, toDate;

if (isCustom) {
  fromDate = customRange.from;
  toDate = customRange.to;
} else {
  toDate = new Date();
  fromDate = new Date();
  fromDate.setDate(toDate.getDate() - days);
}

  return (
    <div ref={panelRef} className="w-full max-w-2xl">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs text-glow-green border border-glow-green/20 font-mono mb-5">
          <Zap size={11} />
          Powered by Gemini + Google Search Console
        </div>
        <h2 className="font-display text-4xl font-bold text-white mb-3">
          Analyze Any Website
        </h2>
        <p className="text-ink-300 text-lg">
          Enter a URL from your Search Console properties and get a full SEO intelligence report.
        </p>
      </div>

      {/* Input card */}
      <div className="animated-border rounded-2xl">
        <div className="glass rounded-2xl p-6 space-y-4">
          {/* URL input */}
          <div>
            <label className="block text-xs text-ink-400 font-mono mb-2 uppercase tracking-wider">Website URL</label>
            <div className="relative">
              <Globe size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                placeholder="example.com or https://example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-ink-500 focus:outline-none focus:border-glow-green/40 focus:bg-white/8 transition-all text-sm"
              />
            </div>
          </div>

          {/* Site picker */}
          {sites.length > 0 && (
            <div>
              <button
                onClick={() => setShowSites(!showSites)}
                className="flex items-center gap-2 text-xs text-glow-blue hover:text-glow-blue/80 transition-colors"
              >
                <Search size={12} />
                Pick from your {sites.length} verified properties
                <ChevronDown size={12} className={cn('transition-transform', showSites && 'rotate-180')} />
              </button>
              {showSites && (
                <div className="mt-2 max-h-40 overflow-y-auto space-y-1 glass rounded-xl p-2">
                  {sites.map((site: { siteUrl: string; permissionLevel: string }) => (
                    <button
                      key={site.siteUrl}
                      onClick={() => { setUrl(site.siteUrl); setShowSites(false) }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-ink-200 hover:text-white transition-colors font-mono"
                    >
                      {site.siteUrl}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Date range */}
          <div>
            <label className="block text-xs text-ink-400 font-mono mb-2 uppercase tracking-wider">Date Range</label>
            <div className="flex gap-2">
  {dayOptions.map(d => (
    <button
      key={d}
      onClick={() => {
        setDays(d);
        setIsCustom(false);
      }}
      className={cn(
        'flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-150',
        !isCustom && days === d
          ? 'bg-glow-green/15 text-glow-green border border-glow-green/30'
          : 'glass text-ink-300 hover:text-white border border-white/5'
      )}
    >
      {d}d
    </button>
  ))}

  {/* Custom button */}
  <button
    onClick={() => setIsCustom(true)}
    className={cn(
      'flex-1 py-2 rounded-lg text-sm font-medium',
      isCustom
        ? 'bg-glow-green/15 text-glow-green border border-glow-green/30'
        : 'glass text-ink-300 hover:text-white border border-white/5'
    )}
  >
    Custom
  </button>
</div>
{isCustom && (
  <div className="flex gap-2 mt-3">
    <input
      type="date"
      value={customRange.from}
      onChange={(e) =>
        setCustomRange({ ...customRange, from: e.target.value })
      }
      className="flex-1 px-3 py-2 rounded-lg glass text-sm"
    />
    <input
      type="date"
      value={customRange.to}
      onChange={(e) =>
        setCustomRange({ ...customRange, to: e.target.value })
      }
      className="flex-1 px-3 py-2 rounded-lg glass text-sm"
    />
  </div>
)}

          </div>

          {/* Submit */}
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2.5 bg-glow-green text-black font-semibold py-3.5 rounded-xl hover:bg-glow-green/90 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed glow-green"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Analyzing…
              </>
            ) : (
              <>
                <Zap size={16} />
                Generate AI Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Features hint */}
      <div className="mt-8 grid grid-cols-3 gap-3">
        {[
          { icon: '📊', title: 'Full GSC Data', desc: 'Clicks, impressions, CTR & positions' },
          { icon: '🤖', title: 'AI Analysis', desc: 'GPT-4o powered insights' },
          { icon: '💬', title: 'Chat Interface', desc: 'Ask questions about your data' },
        ].map(f => (
          <div key={f.title} className="glass rounded-xl p-4 text-center border border-white/5">
            <div className="text-2xl mb-2">{f.icon}</div>
            <p className="text-xs font-semibold text-white mb-1">{f.title}</p>
            <p className="text-xs text-ink-400">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
