import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { chatWithGSCData, GSCData } from '@/lib/ai'
import connectDB from '@/lib/mongodb'
import { ChatSession, Report } from '@/models'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { message, reportId, sessionId } = body

    if (!message || !reportId) {
      return NextResponse.json({ error: 'message and reportId are required' }, { status: 400 })
    }

    await connectDB()

    // Fetch the report for context
    const ReportModel = Report()
    const report = await ReportModel.findOne({
      _id: reportId,
      userId: session.user.id,
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Get or create chat session
    const ChatModel = ChatSession()
    let chatSession = sessionId
      ? await ChatModel.findOne({ _id: sessionId, userId: session.user.id })
      : null

    if (!chatSession) {
      chatSession = await ChatModel.create({
        userId: session.user.id,
        reportId,
        siteUrl: report.siteUrl,
        messages: [],
      })
    }

    // Build conversation history
    const history = chatSession.messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    // Get AI response
    const gscData = report.gscData as unknown as GSCData
    const aiResponse = await chatWithGSCData(message, gscData, history)

    // Save messages
    chatSession.messages.push(
      { role: 'user', content: message, timestamp: new Date() },
      { role: 'assistant', content: aiResponse, timestamp: new Date() }
    )
    await chatSession.save()

    return NextResponse.json({
      response: aiResponse,
      sessionId: chatSession._id.toString(),
    })
  } catch (error: unknown) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Failed to process chat message' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const reportId = url.searchParams.get('reportId')

    if (!reportId) {
      return NextResponse.json({ error: 'reportId is required' }, { status: 400 })
    }

    await connectDB()
    const ChatModel = ChatSession()
    const chatSession = await ChatModel.findOne({
      reportId,
      userId: session.user.id,
    }).sort({ createdAt: -1 })

    return NextResponse.json({ session: chatSession })
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch chat' }, { status: 500 })
  }
}
