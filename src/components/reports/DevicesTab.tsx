'use client'
import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts'
import { formatNumber, formatPercent } from '@/lib/utils'
import { Monitor, Smartphone, Tablet } from 'lucide-react'

interface DeviceRow {
  device: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  DESKTOP: <Monitor size={16} />,
  MOBILE: <Smartphone size={16} />,
  TABLET: <Tablet size={16} />,
}

const COLORS = ['#00ff87', '#0096ff', '#8b5cf6']

export function DevicesTab({ devices }: { devices: DeviceRow[] }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.device-card', { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' })
    }, ref)
    return () => ctx.revert()
  }, [])

  const pieData = devices.map(d => ({
    name: d.device.charAt(0) + d.device.slice(1).toLowerCase(),
    value: d.clicks,
  }))

  const radarData = devices.map(d => ({
    device: d.device.charAt(0) + d.device.slice(1).toLowerCase(),
    CTR: +d.ctr.toFixed(2),
    Position: +(20 - d.position).toFixed(1), // Invert so higher = better
  }))

  const totalClicks = devices.reduce((s, d) => s + d.clicks, 0)

  return (
    <div ref={ref} className="p-6 space-y-6">
      {/* Device cards */}
      <div className="grid grid-cols-3 gap-4">
        {devices.map((d, i) => (
          <div key={d.device} className="device-card glass rounded-xl p-5 border border-white/5 relative overflow-hidden">
            <div className="absolute top-3 right-3 opacity-20" style={{ color: COLORS[i] }}>
              {DEVICE_ICONS[d.device] || <Monitor size={16} />}
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
              <span className="text-xs font-mono uppercase tracking-wider text-ink-300">{d.device}</span>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-ink-400 mb-1">Clicks</p>
                <p className="text-2xl font-display font-bold text-white">{formatNumber(d.clicks)}</p>
                <p className="text-xs text-ink-400 mt-0.5">
                  {totalClicks > 0 ? ((d.clicks / totalClicks) * 100).toFixed(1) : 0}% share
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                <div>
                  <p className="text-xs text-ink-500">Impr.</p>
                  <p className="text-xs font-mono text-ink-200">{formatNumber(d.impressions)}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-500">CTR</p>
                  <p className={`text-xs font-mono ${d.ctr < 2 ? 'text-red-400' : d.ctr < 5 ? 'text-amber-400' : 'text-glow-green'}`}>
                    {formatPercent(d.ctr)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ink-500">Pos.</p>
                  <p className={`text-xs font-mono ${d.position <= 3 ? 'text-glow-green' : d.position <= 10 ? 'text-amber-400' : 'text-red-400'}`}>
                    {d.position.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-5 border border-white/5">
          <h3 className="font-display font-semibold text-white text-sm mb-4">Click Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} innerRadius={40} dataKey="value" strokeWidth={0}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#a0a0b8' }} />
              <Tooltip contentStyle={{ background: '#0a0a1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-xl p-5 border border-white/5">
          <h3 className="font-display font-semibold text-white text-sm mb-4">Performance Radar</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="device" tick={{ fill: '#6060a8', fontSize: 11 }} />
              <Radar name="CTR" dataKey="CTR" stroke="#00ff87" fill="#00ff87" fillOpacity={0.15} />
              <Radar name="Position" dataKey="Position" stroke="#0096ff" fill="#0096ff" fillOpacity={0.15} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#a0a0b8' }} />
              <Tooltip contentStyle={{ background: '#0a0a1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insight */}
      {devices.find(d => d.device === 'MOBILE') && devices.find(d => d.device === 'DESKTOP') && (() => {
        const mob = devices.find(d => d.device === 'MOBILE')!
        const desk = devices.find(d => d.device === 'DESKTOP')!
        const mobShare = totalClicks > 0 ? (mob.clicks / totalClicks) * 100 : 0
        return (
          <div className={`glass rounded-xl p-4 border ${mobShare > 60 ? 'border-glow-green/20 bg-glow-green/5' : 'border-amber-500/20 bg-amber-500/5'}`}>
            <p className="text-sm font-semibold mb-1" style={{ color: mobShare > 60 ? '#00ff87' : '#f59e0b' }}>
              {mobShare > 60 ? '📱 Mobile-First Traffic' : '🖥️ Desktop-Heavy Traffic'}
            </p>
            <p className="text-xs text-ink-300">
              {mobShare > 60
                ? `${mobShare.toFixed(1)}% of your clicks come from mobile. Ensure your pages are fully optimized for mobile UX and Core Web Vitals.`
                : `Only ${mobShare.toFixed(1)}% of clicks are mobile. Consider whether your content better serves desktop users, or if mobile SEO needs improvement.`
              }
            </p>
          </div>
        )
      })()}
    </div>
  )
}
