'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { GSCData, AnalysisResult } from '@/lib/ai'
import { formatNumber, formatPercent, getDeltaColor, getDeltaSign, scoreToLabel } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Props { data: GSCData; analysis: AnalysisResult }

const COLORS = ['#00ff87', '#0096ff', '#8b5cf6', '#f59e0b', '#f87171']

function MetricCard({ label, value, delta, format = 'number' }: {
  label: string; value: number; delta?: number; format?: 'number' | 'percent' | 'position'
}) {
  const formatted = format === 'percent' ? formatPercent(value) : format === 'position' ? value.toFixed(1) : formatNumber(value)
  const deltaColor = delta !== undefined ? getDeltaColor(delta) : ''
  const isUp = delta !== undefined && delta > 0
  const isDown = delta !== undefined && delta < 0
  // For position, lower is better
  const positiveTrend = format === 'position' ? isDown : isUp

  return (
    <div className="glass rounded-xl p-5 border border-white/5 glass-hover transition-all">
      <p className="text-xs text-ink-400 font-mono uppercase tracking-wider mb-2">{label}</p>
      <p className="text-3xl font-display font-bold text-white mb-2">{formatted}</p>
      {delta !== undefined && (
        <div className={`flex items-center gap-1 text-xs ${positiveTrend ? 'text-glow-green' : isDown && format !== 'position' ? 'text-red-400' : isUp && format === 'position' ? 'text-red-400' : 'text-glow-green'}`}>
          {positiveTrend ? <TrendingUp size={11} /> : isDown && format !== 'position' ? <TrendingDown size={11} /> : <Minus size={11} />}
          {getDeltaSign(delta)}{Math.abs(delta).toFixed(1)}% vs prev period
        </div>
      )}
    </div>
  )
}

export function OverviewTab({ data, analysis }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.metric-card', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'power2.out' })
      gsap.fromTo('.analysis-section', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.4, stagger: 0.1, ease: 'power2.out' })
    }, ref)
    return () => ctx.revert()
  }, [])

  const prev = data.overview.previousPeriod
  const clickDelta = prev ? ((data.overview.totalClicks - prev.totalClicks) / (prev.totalClicks || 1)) * 100 : undefined
  const impressionDelta = prev ? ((data.overview.totalImpressions - prev.totalImpressions) / (prev.totalImpressions || 1)) * 100 : undefined
  const ctrDelta = prev ? data.overview.avgCTR - prev.avgCTR : undefined
  const posDelta = prev ? data.overview.avgPosition - prev.avgPosition : undefined

  // Device pie data
  const deviceData = data.devices.map(d => ({
    name: d.device.charAt(0).toUpperCase() + d.device.slice(1),
    value: d.clicks,
  }))

  // Top queries chart data
  const queryChartData = data.topQueries.slice(0, 8).map(q => ({
    name: q.query.length > 20 ? q.query.substring(0, 20) + '…' : q.query,
    clicks: q.clicks,
    impressions: q.impressions,
  }))

  const { label: healthLabel, color: healthColor } = scoreToLabel(analysis.healthScore)

  return (
    <div ref={ref} className="p-6 space-y-6">
      {/* Metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Clicks', value: data.overview.totalClicks, delta: clickDelta, format: 'number' as const },
          { label: 'Impressions', value: data.overview.totalImpressions, delta: impressionDelta, format: 'number' as const },
          { label: 'Avg CTR', value: data.overview.avgCTR, delta: ctrDelta, format: 'percent' as const },
          { label: 'Avg Position', value: data.overview.avgPosition, delta: posDelta, format: 'position' as const },
        ].map(m => (
          <div key={m.label} className="metric-card">
            <MetricCard {...m} />
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Top queries bar */}
        <div className="col-span-2 glass rounded-xl p-5 border border-white/5">
          <h3 className="font-display font-semibold text-white text-sm mb-4">Top Queries — Clicks vs Impressions</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={queryChartData}>
              <defs>
                <linearGradient id="gClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff87" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00ff87" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gImpressions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0096ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0096ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: '#6060a8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#6060a8', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#0a0a1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
              <Area type="monotone" dataKey="clicks" stroke="#00ff87" fill="url(#gClicks)" strokeWidth={2} />
              <Area type="monotone" dataKey="impressions" stroke="#0096ff" fill="url(#gImpressions)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Device split */}
        <div className="glass rounded-xl p-5 border border-white/5">
          <h3 className="font-display font-semibold text-white text-sm mb-4">Device Split</h3>
          {deviceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={deviceData} cx="50%" cy="45%" outerRadius={65} dataKey="value" strokeWidth={0}>
                  {deviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#a0a0b8' }} />
                <Tooltip contentStyle={{ background: '#0a0a1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-ink-400 text-sm text-center mt-10">No device data</p>
          )}
        </div>
      </div>

      {/* AI Analysis */}
      <div className="analysis-section grid grid-cols-2 gap-4">
        {/* Summary */}
        <div className="glass rounded-xl p-5 border border-white/5 col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🤖</span>
                <h3 className="font-display font-semibold text-white text-sm">AI Summary</h3>
              </div>
              <p className="text-ink-200 text-sm leading-relaxed">{analysis.summary}</p>
            </div>
            <div className="shrink-0 text-center">
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke={healthColor} strokeWidth="2.5"
                    strokeDasharray={`${analysis.healthScore} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold font-mono" style={{ color: healthColor }}>{analysis.healthScore}</span>
                </div>
              </div>
              <p className="text-xs mt-1" style={{ color: healthColor }}>{healthLabel}</p>
            </div>
          </div>
        </div>

        {/* Strengths */}
        <div className="glass rounded-xl p-5 border border-glow-green/10">
          <h3 className="font-display font-semibold text-glow-green text-sm mb-3 flex items-center gap-2">
            <span>✅</span> Strengths
          </h3>
          <ul className="space-y-2">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="text-xs text-ink-200 flex items-start gap-2">
                <span className="text-glow-green mt-0.5 shrink-0">→</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="glass rounded-xl p-5 border border-red-500/10">
          <h3 className="font-display font-semibold text-red-400 text-sm mb-3 flex items-center gap-2">
            <span>⚠️</span> Weaknesses
          </h3>
          <ul className="space-y-2">
            {analysis.weaknesses.map((w, i) => (
              <li key={i} className="text-xs text-ink-200 flex items-start gap-2">
                <span className="text-red-400 mt-0.5 shrink-0">→</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
