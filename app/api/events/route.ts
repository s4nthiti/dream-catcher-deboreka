import { NextRequest } from 'next/server'
import { globalEvents, EVENTS } from '@/lib/events'

// Keep connections alive
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  // Create a TransformStream for SSE
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()
  const encoder = new TextEncoder()

  // Send initial connection message
  const sendMessage = async (event: string, data: any) => {
    try {
      await writer.write(
        encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
      )
    } catch (error) {
      console.error('Error sending SSE message:', error)
    }
  }

  // Set up event listeners
  const onEnhancementAdded = (data: any) => sendMessage(EVENTS.ENHANCEMENT_ADDED, data)
  const onEnhancementDeleted = (data: any) => sendMessage(EVENTS.ENHANCEMENT_DELETED, data)
  const onScoreboardUpdated = (data: any) => sendMessage(EVENTS.SCOREBOARD_UPDATED, data)
  const onCrownsUpdated = (data: any) => sendMessage(EVENTS.CROWNS_UPDATED, data)

  globalEvents.on(EVENTS.ENHANCEMENT_ADDED, onEnhancementAdded)
  globalEvents.on(EVENTS.ENHANCEMENT_DELETED, onEnhancementDeleted)
  globalEvents.on(EVENTS.SCOREBOARD_UPDATED, onScoreboardUpdated)
  globalEvents.on(EVENTS.CROWNS_UPDATED, onCrownsUpdated)

  // Send initial connected message
  await sendMessage('connected', { status: 'ok', timestamp: new Date().toISOString() })

  // Clean up on disconnect
  request.signal.addEventListener('abort', () => {
    globalEvents.off(EVENTS.ENHANCEMENT_ADDED, onEnhancementAdded)
    globalEvents.off(EVENTS.ENHANCEMENT_DELETED, onEnhancementDeleted)
    globalEvents.off(EVENTS.SCOREBOARD_UPDATED, onScoreboardUpdated)
    globalEvents.off(EVENTS.CROWNS_UPDATED, onCrownsUpdated)
    writer.close().catch(() => {})
    console.log('SSE connection closed')
  })

  // Return SSE response
  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering in nginx
    },
  })
}

