'use client'
import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { formatNumber, formatPercent } from '@/lib/utils'

interface CountryRow {
  country: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

const COUNTRY_NAMES: Record<string, string> = {
  ind: '🇮🇳 India', usa: '🇺🇸 United States', gbr: '🇬🇧 United Kingdom',
  can: '🇨🇦 Canada', aus: '🇦🇺 Australia', deu: '🇩🇪 Germany',
  fra: '🇫🇷 France', sgp: '🇸🇬 Singapore', nld: '🇳🇱 Netherlands',
  bra: '🇧🇷 Brazil', jpn: '🇯🇵 Japan', kor: '🇰🇷 South Korea',
  mys: '🇲🇾 Malaysia', phl: '🇵🇭 Philippines', pak: '🇵🇰 Pakistan',
  nzl: '🇳🇿 New Zealand', irl: '🇮🇪 Ireland', zaf: '🇿🇦 South Africa',
}

const COLORS = ['#00ff87', '#0096ff', '#8b5cf6', '#f59e0b', '#f87171', '#34d399', '#60a5fa', '#a78bfa']

export function CountriesTab({ countries }: { countries: CountryRow[] }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.country-row', { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.04, ease: 'power2.out' })
    }, ref)
    return () => ctx.revert()
  }, [])

  const topCountries = countries.slice(0, 15)
  const chartData = topCountries.slice(0, 8).map(c => ({
    name: COUNTRY_NAMES[c.country]?.replace(/^.{1,4}/, '').trim() || c.country.toUpperCase(),
    clicks: c.clicks,
    impressions: c.impressions,
  }))

  const maxClicks = Math.max(...topCountries.map(c => c.clicks), 1)

  return (
    <div ref={ref} className="p-6 space-y-6">
      {/* Bar chart */}
      <div className="glass rounded-xl p-5 border border-white/5">
        <h3 className="font-display font-semibold text-white text-sm mb-4">Top Countries by Clicks</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#6060a8', fontSize: 10 }} />
            <YAxis tick={{ fill: '#6060a8', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: '#0a0a1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <Bar dataKey="clicks" radius={[4, 4, 0, 0]}>
              {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="glass rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-xs text-ink-400 font-mono uppercase tracking-wider">Country</th>
              <th className="text-right px-4 py-3 text-xs text-ink-400 font-mono uppercase tracking-wider">Clicks</th>
              <th className="text-right px-4 py-3 text-xs text-ink-400 font-mono uppercase tracking-wider">Impressions</th>
              <th className="text-right px-4 py-3 text-xs text-ink-400 font-mono uppercase tracking-wider">CTR</th>
              <th className="text-right px-4 py-3 text-xs text-ink-400 font-mono uppercase tracking-wider">Position</th>
              <th className="px-4 py-3 text-xs text-ink-400 font-mono uppercase tracking-wider">Share</th>
            </tr>
          </thead>
          <tbody>
            {topCountries.map((c, i) => (
              <tr key={c.country} className="country-row border-b border-white/3 hover:bg-white/3 transition-colors">
                <td className="px-4 py-3 text-white font-medium">
                  <span className="mr-2 text-xs text-ink-500 font-mono">{i + 1}</span>
                  {COUNTRY_NAMES[c.country] || c.country.toUpperCase()}
                </td>
                <td className="px-4 py-3 text-right font-mono text-sm text-white">{formatNumber(c.clicks)}</td>
                <td className="px-4 py-3 text-right font-mono text-sm text-ink-300">{formatNumber(c.impressions)}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`font-mono text-sm ${c.ctr < 2 ? 'text-red-400' : c.ctr < 5 ? 'text-amber-400' : 'text-glow-green'}`}>
                    {formatPercent(c.ctr)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`font-mono text-sm ${c.position <= 3 ? 'text-glow-green' : c.position <= 10 ? 'text-amber-400' : 'text-red-400'}`}>
                    {c.position.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(c.clicks / maxClicks) * 100}%`,
                          background: COLORS[i % COLORS.length],
                        }}
                      />
                    </div>
                    <span className="text-xs text-ink-400 w-8 text-right font-mono">
                      {((c.clicks / maxClicks) * 100).toFixed(0)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
