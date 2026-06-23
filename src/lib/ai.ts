// import OpenAI from 'openai'

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// })

// const MODEL = process.env.OPENAI_MODEL || 'gpt-4o'

// export interface GSCData {
//   siteUrl: string
//   dateRange: { start: string; end: string }
//   overview: {
//     totalClicks: number
//     totalImpressions: number
//     avgCTR: number
//     avgPosition: number
//     previousPeriod?: {
//       totalClicks: number
//       totalImpressions: number
//       avgCTR: number
//       avgPosition: number
//     }
//   }
//   topQueries: Array<{
//     query: string
//     clicks: number
//     impressions: number
//     ctr: number
//     position: number
//   }>
//   topPages: Array<{
//     page: string
//     clicks: number
//     impressions: number
//     ctr: number
//     position: number
//   }>
//   devices: Array<{
//     device: string
//     clicks: number
//     impressions: number
//     ctr: number
//     position: number
//   }>
//   countries: Array<{
//     country: string
//     clicks: number
//     impressions: number
//     ctr: number
//     position: number
//   }>
//   searchTypes?: Array<{
//     type: string
//     clicks: number
//     impressions: number
//   }>
// }

// export interface Suggestion {
//   id: string
//   category: 'ctr' | 'content' | 'technical' | 'ranking' | 'mobile' | 'international'
//   title: string
//   description: string
//   impact: 'high' | 'medium' | 'low'
//   effort: 'easy' | 'medium' | 'hard'
//   specificData?: string
//   actionItems: string[]
// }

// export interface AnalysisResult {
//   summary: string
//   healthScore: number
//   strengths: string[]
//   weaknesses: string[]
//   suggestions: Suggestion[]
//   quickWins: Suggestion[]
// }

// export async function analyzeGSCData(data: GSCData): Promise<AnalysisResult> {
//   const prompt = buildAnalysisPrompt(data)

//   const response = await openai.chat.completions.create({
//     model: MODEL,
//     messages: [
//       {
//         role: 'system',
//         content: `You are an expert SEO analyst with deep knowledge of Google Search Console data interpretation. 
//         You analyze GSC data and provide actionable, specific insights. 
//         Always respond with valid JSON matching the exact schema provided.
//         Be specific, data-driven, and actionable. Reference exact numbers from the data.`,
//       },
//       {
//         role: 'user',
//         content: prompt,
//       },
//     ],
//     response_format: { type: 'json_object' },
//     temperature: 0.3,
//   })

//   const content = response.choices[0].message.content || '{}'
//   const result = JSON.parse(content) as AnalysisResult

//   // Ensure suggestions have IDs
//   result.suggestions = result.suggestions.map((s, i) => ({
//     ...s,
//     id: s.id || `suggestion-${i}`,
//   }))
//   result.quickWins = result.quickWins || result.suggestions.filter(s => s.impact === 'high' && s.effort === 'easy')

//   return result
// }

// export async function chatWithGSCData(
//   userMessage: string,
//   gscData: GSCData,
//   conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
// ): Promise<string> {
//   const systemPrompt = `You are an expert SEO analyst assistant with access to Google Search Console data for ${gscData.siteUrl}.

// Here is the current GSC data summary:
// - Date Range: ${gscData.dateRange.start} to ${gscData.dateRange.end}
// - Total Clicks: ${gscData.overview.totalClicks.toLocaleString()}
// - Total Impressions: ${gscData.overview.totalImpressions.toLocaleString()}
// - Average CTR: ${gscData.overview.avgCTR.toFixed(2)}%
// - Average Position: ${gscData.overview.avgPosition.toFixed(1)}

// Top Queries: ${JSON.stringify(gscData.topQueries.slice(0, 10))}
// Top Pages: ${JSON.stringify(gscData.topPages.slice(0, 10))}
// Devices: ${JSON.stringify(gscData.devices)}
// Countries: ${JSON.stringify(gscData.countries?.slice(0, 5))}

// Answer user questions about this data with specific numbers and actionable insights. Be concise, analytical, and helpful.
// Format responses with markdown for readability. Use bullet points for lists.`

//   const messages = [
//     { role: 'system' as const, content: systemPrompt },
//     ...conversationHistory.slice(-10), // Keep last 10 messages for context
//     { role: 'user' as const, content: userMessage },
//   ]

//   const response = await openai.chat.completions.create({
//     model: MODEL,
//     messages,
//     temperature: 0.5,
//     max_tokens: 1500,
//   })

//   return response.choices[0].message.content || 'I could not generate a response. Please try again.'
// }

// function buildAnalysisPrompt(data: GSCData): string {
//   return `Analyze this Google Search Console data for ${data.siteUrl} and return a JSON object.

// DATA:
// ${JSON.stringify(data, null, 2)}

// Return a JSON object with EXACTLY this structure:
// {
//   "summary": "2-3 sentence executive summary of the site's SEO health",
//   "healthScore": <number 0-100 based on performance>,
//   "strengths": ["strength 1 with specific data", "strength 2", "strength 3"],
//   "weaknesses": ["weakness 1 with specific data", "weakness 2", "weakness 3"],
//   "suggestions": [
//     {
//       "id": "s1",
//       "category": "ctr|content|technical|ranking|mobile|international",
//       "title": "Specific actionable title",
//       "description": "Detailed description referencing actual data from the GSC report",
//       "impact": "high|medium|low",
//       "effort": "easy|medium|hard",
//       "specificData": "The exact metric/page/query this refers to",
//       "actionItems": ["Step 1", "Step 2", "Step 3"]
//     }
//   ],
//   "quickWins": [
//     <subset of suggestions where impact=high and effort=easy>
//   ]
// }

// Generate 8-12 specific, data-driven suggestions. Reference exact queries, pages, and numbers from the data.
// Score the site health 0-100 where 100 is perfect SEO health.`
// }











import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview";

export interface GSCData {
  siteUrl: string
  dateRange: { start: string; end: string }
  overview: {
    totalClicks: number
    totalImpressions: number
    avgCTR: number
    avgPosition: number
    previousPeriod?: {
      totalClicks: number  
      totalImpressions: number
      avgCTR: number
      avgPosition: number
    }  
    
  }
  topQueries: Array<{
    query: string
    clicks: number
    impressions: number
    ctr: number
    position: number
  }>
  topPages: Array<{
    page: string
    clicks: number
    impressions: number
    ctr: number
    position: number
  }>
  devices: Array<{
    device: string
    clicks: number
    impressions: number
    ctr: number
    position: number
  }>
  countries: Array<{
    country: string
    clicks: number
    impressions: number
    ctr: number
    position: number
  }>
  searchTypes?: Array<{
    type: string
    clicks: number
    impressions: number
  }>
}

export interface Suggestion {
  id: string
  category: 'ctr' | 'content' | 'technical' | 'ranking' | 'mobile' | 'international'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  effort: 'easy' | 'medium' | 'hard'
  specificData?: string
  actionItems: string[]
}

export interface AnalysisResult {
  summary: string
  healthScore: number
  strengths: string[]
  weaknesses: string[]
  suggestions: Suggestion[]
  quickWins: Suggestion[]
}

// 🔥 Utility: Clean JSON safely from Gemini response
function extractJSON(text: string): string {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error("No JSON found in response")
  return match[0]
}

export async function analyzeGSCData(data: GSCData): Promise<AnalysisResult> {
  const prompt = buildAnalysisPrompt(data)

  const model = genAI.getGenerativeModel({ model: MODEL })

  const result = await model.generateContent([
    {
      text: `You are an expert SEO analyst.

IMPORTANT:
- Return ONLY raw JSON
- No explanation
- No markdown
- No extra text
- Must be valid JSON
`,
    },
    {
      text: prompt,
    },
  ])

  const response = await result.response
  const text = response.text()

  let parsed: AnalysisResult

  try {
    const cleanJSON = extractJSON(text)
    parsed = JSON.parse(cleanJSON)
  } catch (err) {
    console.error("❌ JSON parse error:", text)
    throw new Error("Invalid JSON from Gemini")
  }

  // Ensure IDs
  parsed.suggestions = parsed.suggestions.map((s, i) => ({
    ...s,
    id: s.id || `suggestion-${i}`,
  }))

  parsed.quickWins =
    parsed.quickWins ||
    parsed.suggestions.filter(
      (s) => s.impact === "high" && s.effort === "easy"
    )

  return parsed
}

export async function chatWithGSCData(
  userMessage: string,
  gscData: GSCData,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {

  const model = genAI.getGenerativeModel({ model: MODEL })

  const systemPrompt = `You are an expert SEO analyst with access to Google Search Console data.

SITE: ${gscData.siteUrl}

DATA SUMMARY:
- Date Range: ${gscData.dateRange.start} to ${gscData.dateRange.end}
- Clicks: ${gscData.overview.totalClicks}
- Impressions: ${gscData.overview.totalImpressions}
- CTR: ${gscData.overview.avgCTR}%
- Position: ${gscData.overview.avgPosition}

TOP QUERIES:
${JSON.stringify(gscData.topQueries.slice(0, 10))}

TOP PAGES:
${JSON.stringify(gscData.topPages.slice(0, 10))}

DEVICES:
${JSON.stringify(gscData.devices)}

COUNTRIES:
${JSON.stringify(gscData.countries.slice(0, 5))}

INSTRUCTIONS:
- Be concise
- Use bullet points
- Give actionable SEO insights
- Reference actual numbers
`

  const historyText = conversationHistory
    .slice(-10)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n")

  const finalPrompt = `
${systemPrompt}

Conversation:
${historyText}

User: ${userMessage}
`

  const result = await model.generateContent(finalPrompt)
  const response = await result.response

  return response.text()
}

function buildAnalysisPrompt(data: GSCData): string {
  return `Analyze this Google Search Console data and return JSON.

DATA:
${JSON.stringify(data, null, 2)}

Return EXACTLY this JSON structure:

{
  "summary": "2-3 sentence summary",
  "healthScore": 85,
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "suggestions": [
    {
      "id": "s1",
      "category": "ctr",
      "title": "...",
      "description": "...",
      "impact": "high",
      "effort": "easy",
      "specificData": "...",
      "actionItems": ["...", "..."]
    }
  ],
  "quickWins": []
}

IMPORTANT:
- Return ONLY JSON
- No explanation
- No markdown
- Must be valid JSON
- Generate 8-12 suggestions
- Use real data from input`
}