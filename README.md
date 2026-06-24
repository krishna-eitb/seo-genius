# SEO Genius — AI-Powered SEO Intelligence

A production-ready Next.js application that connects to Google Search Console via MCP, analyzes your site data with GPT-4o, and delivers actionable SEO recommendations through a conversational chat interface.

---

## Architecture

```
User (Chat UI)
     ↓
Next.js Frontend (React + GSAP + Tailwind)
     ↓
Next.js API Routes (Auth + Orchestration)
     ↓         ↓
GSC API      OpenAI GPT-4o
(read-only)  (analysis + chat)
     ↓
MongoDB (reports + chat sessions)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 18 |
| Styling | Tailwind CSS |
| Animation | GSAP |
| Charts | Recharts |
| Auth | NextAuth.js (Google OAuth) |
| Database | MongoDB + Mongoose |
| AI | OpenAI GPT-4o |
| GSC | Google Search Console API v1 |
| State | Zustand |

---

## Setup

### 1. Clone & install

```bash
git clone <repo>
cd gsc-insight
npm install
```

### 2. Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project
3. Enable **Google Search Console API**
4. Go to **Credentials → Create OAuth 2.0 Client ID**
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy **Client ID** and **Client Secret**

### 3. Environment variables


### 5. Run

```bash
npm run dev
```


---

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

---

## Production Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Add all environment variables in Vercel dashboard.

Update Google OAuth redirect URI to your production URL:
`https://your-domain.com/api/auth/callback/google`

### Environment for production


---

## Notes

- GSC data has a ~3 day delay (this is handled automatically)
- The app requests **read-only** GSC access only
- All reports are stored per-user in MongoDB
- Chat sessions are linked to specific reports
- OpenAI model can be swapped in `.env.local` (gpt-4o recommended)
