'use client'
import { signOut } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { BarChart3, MessageSquare, Clock, LogOut, Zap, Globe, Smartphone, MapPin } from 'lucide-react'

interface SidebarProps {
  user: { name?: string | null; email?: string | null; image?: string | null }
}

export function Sidebar({ user }: SidebarProps) {
  const { reportId, clearReport, setActiveTab, activeTab } = useAppStore()

  const tabs = [
    { id: 'overview',     label: 'Overview',     icon: BarChart3 },
    { id: 'queries',      label: 'Queries',       icon: Zap },
    { id: 'pages',        label: 'Pages',         icon: Globe },
    { id: 'devices',      label: 'Devices',       icon: Smartphone },
    { id: 'countries',    label: 'Countries',     icon: MapPin },
    { id: 'suggestions',  label: 'Suggestions',   icon: MessageSquare },
  ] as const

  return (
    <aside className="w-60 shrink-0 flex flex-col border-r border-white/5 bg-black/20">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-glow-green/30 to-glow-blue/30 flex items-center justify-center border border-glow-green/20">
            <span className="text-glow-green text-sm font-bold font-mono">B</span>
          </div>
          <span className="font-display font-bold text-white text-lg">SEO Brain</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {reportId && (
          <>
            <p className="text-xs text-ink-500 font-mono px-2 mb-3 uppercase tracking-wider">Report</p>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                  activeTab === id
                    ? 'bg-glow-green/10 text-glow-green border border-glow-green/20'
                    : 'text-ink-300 hover:bg-white/5 hover:text-white border border-transparent'
                )}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}

            <div className="my-4 border-t border-white/5" />
          </>
        )}

        <button
          onClick={clearReport}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-300 hover:bg-white/5 hover:text-white transition-all border border-transparent"
        >
          <Clock size={15} />
          New Analysis
        </button>

        <Link
          href="/dashboard/history" 
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-300 hover:bg-white/5 hover:text-white transition-all"
        >
          <BarChart3 size={15} />
          Report History
        </Link>
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg glass mb-2">
          {user.image ? (
            <Image src={user.image} alt="" width={28} height={28} className="rounded-full" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-glow-purple/30 flex items-center justify-center text-xs font-bold text-glow-purple">
              {user.name?.[0] || 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-ink-400 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-ink-400 hover:text-red-400 hover:bg-red-400/5 transition-all"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </aside>
  )
}

interface SidebarProps {
  user: { name?: string | null; email?: string | null; image?: string | null }
}

export function Sidebar1({ user }: SidebarProps) {
  const { reportId, clearReport, setActiveTab, activeTab } = useAppStore()

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'queries', label: 'Queries', icon: Zap },
    { id: 'pages', label: 'Pages', icon: Globe },
    { id: 'suggestions', label: 'Suggestions', icon: MessageSquare },
  ] as const

  return (
    <aside className="w-60 shrink-0 flex flex-col border-r border-white/5 bg-black/20">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-glow-green/30 to-glow-blue/30 flex items-center justify-center border border-glow-green/20">
            <span className="text-glow-green text-sm font-bold font-mono">G</span>
          </div>
          <span className="font-display font-bold text-white text-lg">SEO 
            
            Brain</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {reportId && (
          <>
            <p className="text-xs text-ink-500 font-mono px-2 mb-3 uppercase tracking-wider">Report</p>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                  activeTab === id
                    ? 'bg-glow-green/10 text-glow-green border border-glow-green/20'
                    : 'text-ink-300 hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}

            <div className="my-4 border-t border-white/5" />
          </>
        )}

        <button
          onClick={clearReport}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-300 hover:bg-white/5 hover:text-white transition-all"
        >
          <Clock size={15} />
          New Analysis
        </button>

        <Link
          href="/dashboard/history"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-300 hover:bg-white/5 hover:text-white transition-all"
        >
          <BarChart3 size={15} />
          Report History
        </Link>
      </nav>


      {/* User */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg glass mb-2">
          {user.image ? (
            <Image src={user.image} alt="" width={28} height={28} className="rounded-full" />
            
          ) : (
            <div className="w-7 h-7 rounded-full bg-glow-purple/30 flex items-center justify-center text-xs font-bold text-glow-purple">
              {user.name?.[0] || 'U'}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-ink-400 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-ink-400 hover:text-red-400 hover:bg-red-400/5 transition-all"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
