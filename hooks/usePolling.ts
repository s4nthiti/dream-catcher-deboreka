"use client"

import { useEffect, useRef, useCallback } from "react"

export interface PollingOptions {
  interval?: number // Polling interval in milliseconds (default: 30000 = 30 seconds)
  enabled?: boolean // Whether polling is enabled
  onError?: (error: Error) => void
}

export function usePolling(
  callback: () => void | Promise<void>,
  options: PollingOptions = {}
) {
  const {
    interval = 30000, // 30 seconds default
    enabled = true,
    onError,
  } = options

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const callbackRef = useRef(callback)

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const startPolling = useCallback(() => {
    if (!enabled) return

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Set up polling interval
    intervalRef.current = setInterval(async () => {
      try {
        await callbackRef.current()
      } catch (error) {
        console.error("Polling error:", error)
        if (onError) {
          onError(error instanceof Error ? error : new Error(String(error)))
        }
      }
    }, interval)
  }, [enabled, interval, onError])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (enabled) {
      startPolling()
    } else {
      stopPolling()
    }

    return () => {
      stopPolling()
    }
  }, [enabled, startPolling, stopPolling])

  return {
    startPolling,
    stopPolling,
  }
}

