#!/usr/bin/env node
/**
 * GSC MCP Server
 * Exposes Google Search Console data as MCP tools.
 * Run: node mcp-server/gsc-mcp.js
 *
 * Configure in claude_desktop_config.json:
 * {
 *   "mcpServers": {
 *     "gsc": {
 *       "command": "node",
 *       "args": ["/path/to/gsc-app/mcp-server/gsc-mcp.js"],
 *       "env": {
 *         "GOOGLE_ACCESS_TOKEN": "your_oauth_access_token"
 *       }
 *     }
 *   }
 * }
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js')
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js')
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js')
const { google } = require('googleapis')

const ACCESS_TOKEN = process.env.GOOGLE_ACCESS_TOKEN

function getClient() {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: ACCESS_TOKEN })
  return google.searchconsole({ version: 'v1', auth }) 
}

function getDateRange(days) {
  const end = new Date()
  end.setDate(end.getDate() - 3)
  const start = new Date(end)
  start.setDate(start.getDate() - days)
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  }
}

const TOOLS = [
  {
    name: 'list_sites',
    description: 'List all Google Search Console properties the user has access to',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'get_search_analytics',
    description: 'Get search analytics data (clicks, impressions, CTR, position) for a site',
    inputSchema: {
      type: 'object',
      properties: {
        siteUrl: { type: 'string', description: 'The site URL (e.g. sc-domain:example.com)' },
        days: { type: 'number', description: 'Number of days to look back (default 28)', default: 28 },
        dimensions: {
          type: 'array',
          items: { type: 'string', enum: ['query', 'page', 'device', 'country', 'date'] },
          description: 'Dimensions to group by',
          default: ['query'],
        },
        rowLimit: { type: 'number', description: 'Max rows (default 100)', default: 100 },
      },
      required: ['siteUrl'],
    },
  },
  {
    name: 'get_top_queries',
    description: 'Get the top performing search queries for a site with CTR opportunities highlighted',
    inputSchema: {
      type: 'object',
      properties: {
        siteUrl: { type: 'string', description: 'The site URL' },
        days: { type: 'number', default: 28 },
        limit: { type: 'number', default: 50 },
      },
      required: ['siteUrl'],
    },
  },
  {
    name: 'get_top_pages',
    description: 'Get the top performing pages for a site',
    inputSchema: {
      type: 'object',
      properties: {
        siteUrl: { type: 'string' },
        days: { type: 'number', default: 28 },
        limit: { type: 'number', default: 50 },
      },
      required: ['siteUrl'],
    },
  },
  {
    name: 'get_site_overview',
    description: 'Get a complete overview of a site including total clicks, impressions, CTR, avg position, and device breakdown',
    inputSchema: {
      type: 'object',
      properties: {
        siteUrl: { type: 'string' },
        days: { type: 'number', default: 28 },
      },
      required: ['siteUrl'],
    },
  },
  {
    name: 'list_sitemaps',
    description: 'List sitemaps submitted for a site',
    inputSchema: {
      type: 'object',
      properties: {
        siteUrl: { type: 'string' },
      },
      required: ['siteUrl'],
    },
  },
]

async function callTool(name, args) {
  const sc = getClient()

  switch (name) {
    case 'list_sites': {
      const res = await sc.sites.list()
      const sites = res.data.siteEntry || []
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(sites.map(s => ({ url: s.siteUrl, permission: s.permissionLevel })), null, 2),
        }],
      }
    }

    case 'get_search_analytics': {
      const { siteUrl, days = 28, dimensions = ['query'], rowLimit = 100 } = args
      const { startDate, endDate } = getDateRange(days)
      const res = await sc.searchanalytics.query({
        siteUrl,
        requestBody: { startDate, endDate, dimensions, rowLimit },
      })
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ dateRange: { startDate, endDate }, rows: res.data.rows || [] }, null, 2),
        }],
      }
    }

    case 'get_top_queries': {
      const { siteUrl, days = 28, limit = 50 } = args
      const { startDate, endDate } = getDateRange(days)
      const res = await sc.searchanalytics.query({
        siteUrl,
        requestBody: { startDate, endDate, dimensions: ['query'], rowLimit: limit },
      })
      const rows = (res.data.rows || []).map(r => ({
        query: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: ((r.clicks / r.impressions) * 100).toFixed(2) + '%',
        position: r.position.toFixed(1),
        opportunity: r.impressions > 500 && r.ctr < 0.03 && r.position <= 10 ? '⚡ CTR Opportunity' : null,
      }))
      return { content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }] }
    }

    case 'get_top_pages': {
      const { siteUrl, days = 28, limit = 50 } = args
      const { startDate, endDate } = getDateRange(days)
      const res = await sc.searchanalytics.query({
        siteUrl,
        requestBody: { startDate, endDate, dimensions: ['page'], rowLimit: limit },
      })
      const rows = (res.data.rows || []).map(r => ({
        page: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: ((r.clicks / r.impressions) * 100).toFixed(2) + '%',
        position: r.position.toFixed(1),
      }))
      return { content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }] }
    }

    case 'get_site_overview': {
      const { siteUrl, days = 28 } = args
      const { startDate, endDate } = getDateRange(days)
      const [queryRes, deviceRes] = await Promise.all([
        sc.searchanalytics.query({ siteUrl, requestBody: { startDate, endDate, dimensions: ['query'], rowLimit: 1000 } }),
        sc.searchanalytics.query({ siteUrl, requestBody: { startDate, endDate, dimensions: ['device'] } }),
      ])
      const queries = queryRes.data.rows || []
      const devices = deviceRes.data.rows || []
      const totalClicks = queries.reduce((s, r) => s + r.clicks, 0)
      const totalImpressions = queries.reduce((s, r) => s + r.impressions, 0)
      const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0
      const avgPos = queries.length > 0 ? (queries.reduce((s, r) => s + r.position, 0) / queries.length).toFixed(1) : 0
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            siteUrl, dateRange: { startDate, endDate },
            overview: { totalClicks, totalImpressions, avgCTR: avgCTR + '%', avgPosition: avgPos, totalQueries: queries.length },
            devices: devices.map(d => ({ device: d.keys[0], clicks: d.clicks, impressions: d.impressions })),
          }, null, 2),
        }],
      }
    }

    case 'list_sitemaps': {
      const { siteUrl } = args
      const res = await sc.sitemaps.list({ siteUrl })
      return { content: [{ type: 'text', text: JSON.stringify(res.data.sitemap || [], null, 2) }] }
    }

    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

async function main() {
  if (!ACCESS_TOKEN) {
    console.error('Error: GOOGLE_ACCESS_TOKEN environment variable is required')
    process.exit(1)
  }

  const server = new Server(
    { name: 'gsc-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  )

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }))

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params
    try {
      return await callTool(name, args || {})
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error.message}` }],
        isError: true,
      }
    }
  })

  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('GSC MCP Server running on stdio')
}

main().catch(console.error)
