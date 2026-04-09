import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { CSSProperties } from 'react'

/**
 * Merge Tailwind classes safely — resolves conflicts (e.g. two padding values)
 * and concatenates conditionals cleanly.
 *
 * Usage:
 *   cn('px-4 py-2', isActive && 'bg-gold', className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number with optional suffix (e.g. 1200 → "1.2K")
 */
export function formatStat(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000)    return `${(value / 1_000).toFixed(1)}K`
  return String(value)
}

/**
 * Clamps a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Maps a value from one range to another (lerp interpolation)
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin
}

/**
 * Converts a duration in ms to a CSS transition string
 */
export function transition(
  property: string,
  duration: number = 300,
  easing = 'cubic-bezier(0.16, 1, 0.3, 1)'
): string {
  return `${property} ${duration}ms ${easing}`
}

/**
 * Pluralise a word simply
 */
export function pluralise(count: number, word: string, plural = `${word}s`): string {
  return count === 1 ? word : plural
}

/**
 * Truncate text to a given length with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '…'
}

/**
 * Slugify a string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Format a price — e.g. 45 → "From £45" or "£45–£95"
 */
export function formatPrice(from: number, to?: number, currency = '£'): string {
  if (to && to !== from) return `${currency}${from}–${currency}${to}`
  return `From ${currency}${from}`
}

/**
 * Stagger delay for animation groups
 * Returns a CSS custom property object: { '--delay': '200ms' }
 */
export function staggerDelay(index: number, base = 80): CSSProperties {
  return { '--delay': `${index * base}ms` } as CSSProperties
}

// ── Type helpers ──────────────────────────────────────────────────

export type WithClassName = { className?: string }

// Re-export for convenience
export { clsx }
