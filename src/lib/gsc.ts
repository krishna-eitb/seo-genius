import { google } from 'googleapis'

export function getSearchConsoleClient(accessToken: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )
  auth.setCredentials({ access_token: accessToken })

  return google.searchconsole({ version: 'v1', auth })
}

export async function fetchSiteList(accessToken: string) {
  const sc = getSearchConsoleClient(accessToken)
  const res = await sc.sites.list()
  return res.data.siteEntry || []
}

export async function fetchSearchAnalytics(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string,
  dimensions: string[],
  rowLimit = 1000
) {
  const sc = getSearchConsoleClient(accessToken)
  const res = await sc.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions,
      rowLimit,
      dataState: 'all',
    },
  })
  return res.data.rows || []
}

export async function fetchIndexingStatus(accessToken: string, siteUrl: string) {
  const sc = getSearchConsoleClient(accessToken)
  try {
    const res = await sc.urlInspection.index.inspect({
      requestBody: {
        inspectionUrl: siteUrl,
        siteUrl,
      },
    })
    return res.data
  } catch {
    return null
  }
}

export async function fetchSitemaps(accessToken: string, siteUrl: string) {
  const sc = getSearchConsoleClient(accessToken)
  try {
    const res = await sc.sitemaps.list({ siteUrl })
    return res.data.sitemap || []
  } catch {
    return []
  }
}

export function getDateRange(days: number) {
  const end = new Date()
  end.setDate(end.getDate() - 3) // GSC has ~3 day delay
  const start = new Date(end)
  start.setDate(start.getDate() - days)
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  }
}

/**
 * Returns the period immediately preceding the current `days`-length window,
 * with no overlap with it (e.g. if current = last 28 days, previous = the
 * 28 days before that). The old approach of calling getDateRange(days * 2)
 * produced a range that *contains* the current period, which silently
 * inflated the "previous period" totals and made every delta wrong.
 */
export function getPreviousDateRange(days: number) {
  const { startDate: currentStart } = getDateRange(days)
  const end = new Date(currentStart)
  end.setDate(end.getDate() - 1)
  const start = new Date(end)
  start.setDate(start.getDate() - days)
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  }
}

/**
 * Fetches the true, unfiltered site-wide totals for a date range by querying
 * the Search Analytics API with NO dimensions. This matches exactly what the
 * Search Console UI shows.
 *
 * IMPORTANT: Do not derive totals (clicks/impressions/ctr/position) by summing
 * a dimension-broken-down response (e.g. dimensions: ['query']). Google applies
 * privacy filtering/anonymization to query-level breakdowns, dropping rare/
 * low-volume queries — so a sum over that array will under-count vs. reality.
 * Per-dimension breakdowns are fine for tables (Top Queries, Top Pages, etc.)
 * but must never be summed to produce the headline overview metrics.
 */
export async function fetchTotals(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string
) {
  const sc = getSearchConsoleClient(accessToken)
  const res = await sc.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: [],
      rowLimit: 1,
      dataState: 'all',
    },
  })
  const row = res.data.rows?.[0]
  return {
    clicks: row?.clicks ?? 0,
    impressions: row?.impressions ?? 0,
    ctr: (row?.ctr ?? 0) * 100, // Google returns ctr as a 0-1 fraction
    position: row?.position ?? 0, // already impression-weighted by Google
  }
}

export function calculateCTR(clicks: number, impressions: number) {
  if (impressions === 0) return 0
  return (clicks / impressions) * 100
}

export function calculateDelta(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}