import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function formatPercent(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`
}

export function formatPosition(n: number): string {
  return n.toFixed(1)
}

export function getDeltaColor(delta: number): string {
  if (delta > 0) return 'text-glow-green'
  if (delta < 0) return 'text-red-400'
  return 'text-gray-400'
}

export function getDeltaSign(delta: number): string {
  if (delta > 0) return '+'
  return ''
}

export function getImpactColor(impact: string): string {
  switch (impact) {
    case 'high': return 'text-glow-green bg-green-500/10 border-green-500/30'
    case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
    default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30'
  }
}

export function getEffortColor(effort: string): string {
  switch (effort) {
    case 'easy': return 'text-glow-green bg-green-500/10 border-green-500/30'
    case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    case 'hard': return 'text-red-400 bg-red-500/10 border-red-500/30'
    default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30'
  }
}

export function getCategoryIcon(category: string): string {
  switch (category) {
    case 'ctr': return '🎯'
    case 'content': return '📝'
    case 'technical': return '⚙️'
    case 'ranking': return '📈'
    case 'mobile': return '📱'
    case 'international': return '🌍'
    default: return '💡'
  }
}

export function truncateUrl(url: string, maxLen = 60): string {
  const stripped = url.replace(/^https?:\/\/(www\.)?/, '')
  if (stripped.length <= maxLen) return stripped
  return stripped.substring(0, maxLen) + '…'
}

export function scoreToLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Excellent', color: '#00ff87' }
  if (score >= 60) return { label: 'Good', color: '#60d394' }
  if (score >= 40) return { label: 'Fair', color: '#f59e0b' }
  if (score >= 20) return { label: 'Poor', color: '#f87171' }
  return { label: 'Critical', color: '#ef4444' }
}
