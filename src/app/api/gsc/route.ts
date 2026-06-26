import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import {
  fetchSearchAnalytics,
  fetchSiteList,
  fetchSitemaps,
  fetchTotals,
  getDateRange,
  getPreviousDateRange,
  calculateCTR,
} from '@/lib/gsc'
import { analyzeGSCData, GSCData } from '@/lib/ai'
import connectDB from '@/lib/mongodb'
import { Report } from '@/models'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { siteUrl, days = 28 } = body

    if (!siteUrl) {
      return NextResponse.json({ error: 'siteUrl is required' }, { status: 400 })
    }

    const { startDate, endDate } = getDateRange(days)
    const { startDate: prevStart, endDate: prevEnd } = getPreviousDateRange(days)

    // Fetch all GSC data in parallel.
    // NOTE: totals/prevTotals use an unfiltered, no-dimension query — this is
    // the only way to get numbers that match the Search Console UI exactly.
    // The 'query'-dimension call below is privacy-filtered by Google and must
    // only be used for the Top Queries table, never summed for the overview.
    const [queryRows, pageRows, deviceRows, countryRows, totalsResult, prevTotalsResult, sitemaps] =
      await Promise.allSettled([
        fetchSearchAnalytics(session.accessToken, siteUrl, startDate, endDate, ['query'], 25000),
        fetchSearchAnalytics(session.accessToken, siteUrl, startDate, endDate, ['page'], 100),
        fetchSearchAnalytics(session.accessToken, siteUrl, startDate, endDate, ['device']),
        fetchSearchAnalytics(session.accessToken, siteUrl, startDate, endDate, ['country'], 50),
        fetchTotals(session.accessToken, siteUrl, startDate, endDate),
        fetchTotals(session.accessToken, siteUrl, prevStart, prevEnd),
        fetchSitemaps(session.accessToken, siteUrl),
      ])

    const queries = queryRows.status === 'fulfilled' ? queryRows.value : []
    const pages = pageRows.status === 'fulfilled' ? pageRows.value : []
    const devices = deviceRows.status === 'fulfilled' ? deviceRows.value : []
    const countries = countryRows.status === 'fulfilled' ? countryRows.value : []

    // Real, unfiltered site totals (matches Search Console's own Overview page)
    const totals = totalsResult.status === 'fulfilled'
      ? totalsResult.value
      : { clicks: 0, impressions: 0, ctr: 0, position: 0 }
    const prevTotals = prevTotalsResult.status === 'fulfilled'
      ? prevTotalsResult.value
      : { clicks: 0, impressions: 0, ctr: 0, position: 0 }

    const totalClicks = totals.clicks
    const totalImpressions = totals.impressions
    const avgCTR = totals.ctr
    const avgPosition = totals.position

    const prevClicks = prevTotals.clicks
    const prevImpressions = prevTotals.impressions
    const prevAvgCTR = prevTotals.ctr
    const prevAvgPosition = prevTotals.position

    const gscData: GSCData = {
      siteUrl,
      dateRange: { start: startDate, end: endDate },
      overview: {
        totalClicks,
        totalImpressions,
        avgCTR,
        avgPosition,
        previousPeriod: {
          totalClicks: prevClicks,
          totalImpressions: prevImpressions,
          avgCTR: prevAvgCTR,
          avgPosition: prevAvgPosition,
        },
      },
      topQueries: queries
        .map((r) => ({
          query: r.keys?.[0] || '',
          clicks: r.clicks || 0,
          impressions: r.impressions || 0,
          ctr: calculateCTR(r.clicks || 0, r.impressions || 0),
          position: r.position || 0,
        }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 100),
      topPages: pages
        .map((r) => ({
          page: r.keys?.[0] || '',
          clicks: r.clicks || 0,
          impressions: r.impressions || 0,
          ctr: calculateCTR(r.clicks || 0, r.impressions || 0),
          position: r.position || 0,
        }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 50),
      devices: devices.map((r) => ({
        device: r.keys?.[0] || '',
        clicks: r.clicks || 0,
        impressions: r.impressions || 0,
        ctr: calculateCTR(r.clicks || 0, r.impressions || 0),
        position: r.position || 0,
      })),
      countries: countries
        .map((r) => ({
          country: r.keys?.[0] || '',
          clicks: r.clicks || 0,
          impressions: r.impressions || 0,
          ctr: calculateCTR(r.clicks || 0, r.impressions || 0),
          position: r.position || 0,
        }))
        .sort((a, b) => b.clicks - a.clicks),
    }

    // Run AI analysis
    const analysis = await analyzeGSCData(gscData)

    // Save to MongoDB
    await connectDB()
    const ReportModel = Report()
    const report = await ReportModel.create({
      userId: session.user.id,
      siteUrl,
      dateRange: { start: startDate, end: endDate },
      gscData,
      analysis,
    })

    return NextResponse.json({
      reportId: report._id.toString(),
      gscData,
      analysis,
    })
  } catch (error: unknown) {
    console.error('GSC fetch error:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch GSC data'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const listSites = url.searchParams.get('listSites')

    if (listSites) {
      const sites = await fetchSiteList(session.accessToken)
      return NextResponse.json({ sites })
    }

    // Return recent reports
    await connectDB()
    const ReportModel = Report()
    const reports = await ReportModel.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('siteUrl dateRange analysis.healthScore createdAt')

    return NextResponse.json({ reports })
  } catch (error: unknown) {
    console.error('GSC GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}