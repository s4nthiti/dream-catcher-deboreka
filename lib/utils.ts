import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get the start of the current week (Sunday)
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day // Subtract days to get to Sunday
  const sunday = new Date(d.setDate(diff))
  sunday.setHours(0, 0, 0, 0)
  return sunday
}

// Get the end of the current week (Saturday)
export function getWeekEnd(date: Date = new Date()): Date {
  const start = getWeekStart(date)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

// Check if a date is Sunday
export function isSunday(date: Date = new Date()): boolean {
  return date.getDay() === 0
}

// Deboreka part prices (in silver)
export const DEBOREKA_PRICES: Record<string, number> = {
  NECKLACE: 1000000000, // 1 billion silver
  EARRING: 800000000,   // 800 million silver
  RING: 600000000,      // 600 million silver
  BELT: 900000000,      // 900 million silver
}

export const DEBOREKA_PARTS = ['NECKLACE', 'EARRING', 'RING', 'BELT'] as const
export type DeborekaPart = typeof DEBOREKA_PARTS[number]

