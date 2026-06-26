'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useAppStore } from '@/lib/store'
import { OverviewTab } from './reports/OverviewTab'
import { QueriesTab } from './reports/QueriesTab'
import { PagesTab } from './reports/PagesTab'
import { SuggestionsTab } from './reports/SuggestionsTab'
import { DevicesTab } from './reports/DevicesTab'
import { CountriesTab } from './reports/CountriesTab'
import { LoadingReport } from './ui/LoadingReport'
import { ExportButton } from './ui/ExportButton'
import { cn } from '@/lib/utils'
import { BarChart3, MessageSquare, Globe, Zap, Smartphone, MapPin } from 'lucide-react'

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'queries', label: 'Queries', icon: Zap },
  { id: 'pages', label: 'Pages', icon: Globe },
  { id: 'devices', label: 'Devices', icon: Smartphone },
  { id: 'countries', label: 'Countries', icon: MapPin },
  { id: 'suggestions', label: 'Suggestions', icon: MessageSquare },
] as const

export function ReportView() {
  const { gscData, analysis, isLoadingReport, activeTab, setActiveTab, reportId } = useAppStore()
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (gscData) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      )
    }
  }, [gscData])

  if (isLoadingReport) return <LoadingReport />
  if (!gscData || !analysis) return null

  return (
    <div className="h-full flex flex-col">
      {/* Report header */}
      <div ref={headerRef} className="shrink-0 px-6 pt-5 pb-0 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-ink-400 font-mono mb-1">Analyzing</p>
            <h2 className="font-display text-xl font-bold text-white">{gscData.siteUrl}</h2>
            <p className="text-xs text-ink-400 mt-0.5">
              {gscData.dateRange.start} → {gscData.dateRange.end}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ExportButton />
            <div className="text-right">
              <p className="text-xs text-ink-400">Health Score</p>
              <p className={cn(
                'text-2xl font-display font-bold',
                analysis.healthScore >= 70 ? 'text-glow-green' :
                analysis.healthScore >= 40 ? 'text-amber-400' : 'text-red-400'
              )}>
                {analysis.healthScore}<span className="text-sm text-ink-400">/100</span>
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all duration-150 relative',
                activeTab === id
                  ? 'text-glow-green bg-glow-green/5 tab-active'
                  : 'text-ink-400 hover:text-white hover:bg-white/3'
              )}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'overview' && <OverviewTab data={gscData} analysis={analysis} />}
        {activeTab === 'queries' && <QueriesTab queries={gscData.topQueries} />}
        {activeTab === 'pages' && <PagesTab pages={gscData.topPages} />}
        {activeTab === 'devices' && <DevicesTab devices={gscData.devices} />}
        {activeTab === 'countries' && <CountriesTab countries={gscData.countries || []} />}
        {activeTab === 'suggestions' && <SuggestionsTab analysis={analysis} />}
      </div>
    </div>
  )
}
