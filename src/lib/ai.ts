import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const MODEL =
  process.env.GEMINI_MODEL ||
  "gemini-2.5-flash";
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



export async function analyzeGSCData(
  data: GSCData
): Promise<AnalysisResult> {
  const optimizedData = {
    siteUrl: data.siteUrl,

    overview: data.overview,

    topQueries: data.topQueries
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 20),

    topPages: data.topPages
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 20),

    devices: data.devices,

    countries: data.countries.slice(0, 10),
  }

  const prompt = `
You are a senior SEO consultant.

Analyze this Google Search Console data.

DATA:
${JSON.stringify(optimizedData)}

Return ONLY valid JSON.

{
  "summary": "",
  "healthScore": 0,
  "strengths": [],
  "weaknesses": [],
  "suggestions": [
    {
      "id": "s1",
      "category": "ctr",
      "title": "",
      "description": "",
      "impact": "high",
      "effort": "easy",
      "specificData": "",
      "actionItems": []
    }
  ],
  "quickWins": []
}

Rules:
- Health score 0-100
- 5-8 suggestions maximum
- Use actual GSC numbers
- Return JSON only
`;

  const model = genAI.getGenerativeModel({
  model: MODEL,
});
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("Gemini request timeout"));
    }, 20000);
  });

  try {
    const result: any = await Promise.race([
      model.generateContent(prompt),
      timeoutPromise,
    ]);

    const response = await result.response;
    const text = response.text();

    const cleanJSON = extractJSON(text);

    const parsed: AnalysisResult = JSON.parse(cleanJSON);

    parsed.suggestions = (parsed.suggestions || []).map(
      (s, index) => ({
        ...s,
        id: s.id || `suggestion-${index + 1}`,
      })
    );

    parsed.quickWins =
      parsed.quickWins?.length
        ? parsed.quickWins
        : parsed.suggestions.filter(
            (s) =>
              s.impact === "high" &&
              s.effort === "easy"
          );

    return parsed;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);

    return {
      summary:
        "AI analysis temporarily unavailable. Basic report generated successfully.",
      healthScore: 75,
      strengths: [],
      weaknesses: [],
      suggestions: [
        {
          id: "fallback-1",
          category: "content",
          title: "Review Top Performing Queries",
          description:
            "AI analysis timed out. Review top performing queries manually.",
          impact: "medium",
          effort: "easy",
          specificData: "",
          actionItems: [
            "Review top queries",
            "Improve CTR",
            "Optimize top pages",
          ],
        },
      ],
      quickWins: [],
    };
  }
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