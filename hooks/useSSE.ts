"use client"

import { useEffect, useRef, useCallback } from "react"

export interface SSEMessage<T = any> {
  event: string
  data: T
}

export function useSSE(
  url: string,
  onMessage: (message: SSEMessage) => void,
  enabled: boolean = true
) {
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const MAX_RECONNECT_ATTEMPTS = 5
  const RECONNECT_DELAY = 3000

  const connect = useCallback(() => {
    if (!enabled || typeof window === "undefined") return

    try {
      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      const eventSource = new EventSource(url)
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log("SSE connection established")
        reconnectAttemptsRef.current = 0
      }

      eventSource.addEventListener("connected", (e) => {
        const data = JSON.parse(e.data)
        console.log("SSE connected:", data)
      })

      // Listen for all event types
      const eventTypes = [
        "enhancement:added",
        "enhancement:deleted",
        "scoreboard:updated",
        "crowns:updated",
      ]

      eventTypes.forEach((eventType) => {
        eventSource.addEventListener(eventType, (e) => {
          try {
            const data = JSON.parse(e.data)
            onMessage({ event: eventType, data })
          } catch (error) {
            console.error("Error parsing SSE message:", error)
          }
        })
      })

      eventSource.onerror = (error) => {
        console.error("SSE error:", error)
        eventSource.close()

        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++
          const delay = RECONNECT_DELAY * reconnectAttemptsRef.current
          console.log(`Reconnecting in ${delay}ms... (attempt ${reconnectAttemptsRef.current})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        } else {
          console.error("Max reconnection attempts reached")
        }
      }
    } catch (error) {
      console.error("Error creating SSE connection:", error)
    }
  }, [url, enabled, onMessage])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [connect])

  return {
    reconnect: connect,
  }
}

