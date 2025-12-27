// Simple event emitter for SSE broadcasting
type EventCallback = (data: any) => void

class EventEmitter {
  private listeners: Map<string, Set<EventCallback>> = new Map()

  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  off(event: string, callback: EventCallback) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.delete(callback)
    }
  }

  emit(event: string, data: any) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in event callback:', error)
        }
      })
    }
  }

  listenerCount(event: string): number {
    return this.listeners.get(event)?.size || 0
  }
}

// Global event emitter instance
export const globalEvents = new EventEmitter()

// Event types
export const EVENTS = {
  ENHANCEMENT_ADDED: 'enhancement:added',
  ENHANCEMENT_DELETED: 'enhancement:deleted',
  SCOREBOARD_UPDATED: 'scoreboard:updated',
  CROWNS_UPDATED: 'crowns:updated',
} as const

