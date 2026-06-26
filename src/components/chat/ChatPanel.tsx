'use client'
import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Send, Bot, User, Loader2, MessageSquare } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'
import { gsap } from 'gsap'

const QUICK_PROMPTS = [
  'Why did traffic drop?',
  'Which pages should I fix first?',
  'Give me quick wins',
  'What keywords am I missing?',
  'Explain my CTR performance',
]

export function ChatPanel() {
  const { reportId, chatMessages, addChatMessage, setChatLoading, isChatLoading, chatSessionId, setChatSession } = useAppStore()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(panelRef.current, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' })
    })
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || !reportId || isChatLoading) return

    setInput('')
    addChatMessage('user', msg)
    setChatLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, reportId, sessionId: chatSessionId }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      addChatMessage('assistant', data.response)
      if (!chatSessionId) setChatSession(data.sessionId)
    } catch (err) {
      addChatMessage('assistant', '⚠️ Failed to get a response. Please try again.')
    } finally {
      setChatLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div ref={panelRef} className="h-full flex flex-col bg-black/10">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-glow-green/15 border border-glow-green/25 flex items-center justify-center">
            <Bot size={14} className="text-glow-green" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">AI SEO Assistant</p>
            <p className="text-xs text-ink-400">Ask about your data</p>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full bg-glow-green animate-pulse" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {chatMessages.length === 0 && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <MessageSquare size={28} className="text-ink-600 mx-auto mb-3" />
              <p className="text-sm text-ink-400">Ask anything about your SEO data</p>
            </div>
            <div className="space-y-2">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="w-full text-left px-3 py-2.5 glass rounded-xl text-xs text-ink-300 hover:text-white hover:bg-white/5 border border-white/5 transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatMessages.map((msg, i) => (
          <div
            key={i}
            className={cn('flex gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-glow-green/15 border border-glow-green/25 flex items-center justify-center shrink-0 mt-1">
                <Bot size={11} className="text-glow-green" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed',
                msg.role === 'user'
                  ? 'bg-glow-green/15 text-white border border-glow-green/20'
                  : 'glass border border-white/8 text-ink-100'
              )}
            >
              {msg.role === 'assistant' ? (
                <div className="prose-dark">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-glow-blue/15 border border-glow-blue/25 flex items-center justify-center shrink-0 mt-1">
                <User size={11} className="text-glow-blue" />
              </div>
            )}
          </div>
        ))}

        {isChatLoading && (
          <div className="flex gap-2.5">
            <div className="w-6 h-6 rounded-full bg-glow-green/15 border border-glow-green/25 flex items-center justify-center shrink-0">
              <Bot size={11} className="text-glow-green" />
            </div>
            <div className="glass rounded-xl px-3.5 py-2.5 border border-white/8 flex items-center gap-2">
              <Loader2 size={12} className="text-glow-green animate-spin" />
              <span className="text-xs text-ink-400">Analyzing…</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 shrink-0 border-t border-white/5 pt-3">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your SEO data…"
            rows={1}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-ink-500 focus:outline-none focus:border-glow-green/30 transition-all resize-none leading-relaxed"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isChatLoading}
            className="w-9 h-9 flex items-center justify-center bg-glow-green text-black rounded-xl hover:bg-glow-green/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-center text-xs text-ink-600 mt-2">Enter to send · Shift+Enter for newline</p>
      </div>
    </div>
  )
}
