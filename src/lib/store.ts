import { create } from 'zustand'
import { GSCData, AnalysisResult } from '@/lib/ai'

interface AppState {
  // Current report state
  reportId: string | null
  gscData: GSCData | null
  analysis: AnalysisResult | null
  isLoadingReport: boolean
  reportError: string | null

  // Chat state
  chatSessionId: string | null
  chatMessages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>
  isChatLoading: boolean

  // Site list
  sites: Array<{ siteUrl: string; permissionLevel: string }>
  isSitesLoading: boolean

  // UI state
  activeTab: 'overview' | 'queries' | 'pages' | 'devices' | 'countries' | 'suggestions'

  // Actions
  setReport: (id: string, data: GSCData, analysis: AnalysisResult) => void
  setLoadingReport: (loading: boolean) => void
  setReportError: (error: string | null) => void
  addChatMessage: (role: 'user' | 'assistant', content: string) => void
  setChatLoading: (loading: boolean) => void
  setChatSession: (id: string) => void
  setSites: (sites: Array<{ siteUrl: string; permissionLevel: string }>) => void
  setSitesLoading: (loading: boolean) => void
  setActiveTab: (tab: AppState['activeTab']) => void
  clearReport: () => void
}

export const useAppStore = create<AppState>((set) => ({
  reportId: null,
  gscData: null,
  analysis: null,
  isLoadingReport: false,
  reportError: null,
  chatSessionId: null,
  chatMessages: [],
  isChatLoading: false,
  sites: [],
  isSitesLoading: false,
  activeTab: 'overview',

  setReport: (id, data, analysis) =>
    set({ reportId: id, gscData: data, analysis, isLoadingReport: false, reportError: null }),

  setLoadingReport: (loading) => set({ isLoadingReport: loading }),
  setReportError: (error) => set({ reportError: error, isLoadingReport: false }),

  addChatMessage: (role, content) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, { role, content, timestamp: new Date() }],
    })),

  setChatLoading: (loading) => set({ isChatLoading: loading }),
  setChatSession: (id) => set({ chatSessionId: id }),
  setSites: (sites) => set({ sites }),
  setSitesLoading: (loading) => set({ isSitesLoading: loading }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  clearReport: () =>
    set({
      reportId: null,
      gscData: null,
      analysis: null,
      chatSessionId: null,
      chatMessages: [],
      reportError: null,
    }),
}))
