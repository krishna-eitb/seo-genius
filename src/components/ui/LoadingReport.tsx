'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const LOADING_STEPS = [
  { label: 'Connecting to Search Console', icon: '🔗' },
  { label: 'Fetching query performance data', icon: '📊' },
  { label: 'Analyzing page metrics', icon: '📄' },
  { label: 'Running AI analysis', icon: '🤖' },
  { label: 'Generating suggestions', icon: '💡' },
]

export function LoadingReport() {
  const ref = useRef<HTMLDivElement>(null)
  const stepRef = useRef(0)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate steps sequentially
      gsap.fromTo('.loading-step', { opacity: 0, x: -15 }, {
        opacity: 1, x: 0, duration: 0.4, stagger: 0.6, ease: 'power2.out'
      })
      // Shimmer effect on skeleton cards
      gsap.to('.shimmer-card', { backgroundPosition: '200% 0', duration: 1.5, repeat: -1, ease: 'none' })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref} className="p-6 space-y-6 h-full">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="shimmer-card h-4 w-20 rounded-lg" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)', backgroundSize: '200% 100%' }} />
          <div className="shimmer-card h-6 w-48 rounded-lg" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)', backgroundSize: '200% 100%' }} />
        </div>
      </div>

      {/* Metric cards skeleton */}
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass rounded-xl p-5 border border-white/5">
            <div className="shimmer-card h-3 w-16 rounded mb-3" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)', backgroundSize: '200% 100%' }} />
            <div className="shimmer-card h-8 w-24 rounded mb-2" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)', backgroundSize: '200% 100%' }} />
            <div className="shimmer-card h-3 w-20 rounded" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)', backgroundSize: '200% 100%' }} />
          </div>
        ))}
      </div>

      {/* Loading steps */}
      <div className="glass rounded-2xl p-6 border border-white/5 max-w-md mx-auto mt-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-glow-green animate-pulse" />
          <p className="text-sm font-semibold text-white">Generating your report…</p>
        </div>
        <div className="space-y-4">
          {LOADING_STEPS.map((step, i) => (
            <div key={i} className="loading-step flex items-center gap-3 opacity-0">
              <span className="text-lg">{step.icon}</span>
              <div className="flex-1">
                <p className="text-sm text-ink-200">{step.label}</p>
                <div className="mt-1.5 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-glow-green to-glow-blue rounded-full"
                    style={{
                      width: '100%',
                      animation: `shimmer ${1 + i * 0.2}s linear infinite`,
                      backgroundSize: '200% 100%',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
