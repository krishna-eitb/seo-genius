'use client'
import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { gsap } from 'gsap'
import { useAppStore } from '@/lib/store'
import { UrlInputPanel } from '@/components/UrlInputPanel'
import { ReportView } from '@/components/ReportView'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { GSCData, AnalysisResult } from '@/lib/ai'

export default function DashboardClient() {
  const { reportId, isLoadingReport, setReport, setLoadingReport, setReportError } = useAppStore()
  const searchParams = useSearchParams()
  const containerRef = useRef<HTMLDivElement>(null)

  // Load report from URL param ?report=<id>
  useEffect(() => {
    const id = searchParams.get('report')
    if (id && id !== reportId) {
      setLoadingReport(true)
      fetch(`/api/gsc/${id}`)
        .then(r => r.json())
        .then(data => {
          if (data.report) {
            setReport(
              data.report._id,
              data.report.gscData as GSCData,
              data.report.analysis as AnalysisResult
            )
          } else {
            setReportError('Report not found')
          }
        })
        .catch(() => setReportError('Failed to load report'))
    }
  }, [searchParams])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.dash-reveal',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' }
      )
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="h-full flex flex-col">
      {/* Top bar */}
      <div className="dash-reveal flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
        <div>
          <h1 className="font-display text-xl font-bold text-white">SEO Intelligence Hub</h1>
          <p className="text-ink-400 text-sm">Analyze your Search Console data with AI</p>
        </div>
        {reportId && (
          <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs text-glow-green border border-glow-green/20">
            <span className="w-1.5 h-1.5 rounded-full bg-glow-green animate-pulse" />
            Report Active
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left: Report area */}
        <div className="flex-1 overflow-auto">
          {!reportId && !isLoadingReport ? (
            <div className="h-full flex items-center justify-center p-8">
              <UrlInputPanel />
            </div>
          ) : (
            <ReportView />
          )}
        </div>

        {/* Right: Chat panel (visible when report loaded or loading) */}
        {(reportId || isLoadingReport) && (
          <div className="w-96 border-l border-white/5 shrink-0">
            <ChatPanel />
          </div>
        )}
      </div>
    </div>
  )
}
