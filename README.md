
## Features

### 📊 Full GSC Reports
- Total clicks, impressions, CTR, avg position
- Period-over-period comparison with delta indicators  
- Top 500 queries with CTR opportunity detection
- Top 50 pages with click-through visualization
- Device split (desktop/mobile/tablet)
- Country breakdown

### 🤖 AI Analysis (GPT-4o)
- Executive summary with health score (0–100)
- Strengths and weaknesses based on real data
- 8–12 specific, data-driven suggestions
- Each suggestion includes: impact level, effort level, category, specific data reference, action items

### 💬 Chat Interface
- Ask natural language questions about your data
- "Why did traffic drop last week?"
- "Which pages should I fix first?"
- "Give me quick wins"
- Full conversation history per report

### ⚡ Priority Scoring
Every suggestion is scored:
- **Impact**: High / Medium / Low
- **Effort**: Easy / Medium / Hard
- Quick Wins filter: High impact + Easy effort

### 🎨 UI
- Dark glassmorphism design
- GSAP animations throughout
- Animated border effects
- Recharts data visualizations
- Fully responsive

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # Google OAuth
│   │   ├── gsc/                  # GSC data fetch + analysis
│   │   └── chat/                 # AI chat endpoint
│   ├── dashboard/                # Main app
│   ├── login/                    # Login page
│   └── globals.css
├── components/
│   ├── chat/ChatPanel.tsx        # Chat interface
│   ├── reports/
│   │   ├── OverviewTab.tsx       # Metrics + charts
│   │   ├── QueriesTab.tsx        # Queries table
│   │   ├── PagesTab.tsx          # Pages cards
│   │   └── SuggestionsTab.tsx    # AI suggestions
│   ├── ui/LoadingReport.tsx      # Skeleton loader
│   ├── ReportView.tsx            # Tab orchestrator
│   ├── Sidebar.tsx               # Navigation
│   └── UrlInputPanel.tsx         # URL entry
├── lib/
│   ├── ai.ts                     # OpenAI integration
│   ├── gsc.ts                    # GSC API client
│   ├── mongodb.ts                # DB connection
│   ├── store.ts                  # Zustand state
│   └── utils.ts                  # Helpers
└── models/
    └── index.ts                  # Mongoose models
```



## Notes

- GSC data has a ~3 day delay (this is handled automatically)
- The app requests **read-only** GSC access only
- All reports are stored per-user in MongoDB
- Chat sessions are linked to specific reports
