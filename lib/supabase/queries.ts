/**
 * Supabase typed query helpers
 *
 * All DB access funnels through here — gives one place to add caching,
 * logging, or fallback logic without touching individual components.
 *
 * ── Pattern ────────────────────────────────────────────────────
 * - Server component queries: use createClient() (server-side)
 * - Client component queries: use createBrowserClient() directly
 * - All functions here are server-side only (no 'use client')
 */

import { cache } from 'react'
import { createClient } from './server'
import type {
  Service,
  ServiceCategory,
  Testimonial,
  Hairstyle,
  FaceShape,
  FaqItem,
  FaqCategory,
  DayAvailability,
} from '@/types'

// ── Services ───────────────────────────────────────────────────

/** All services, ordered. Used in pricing page, system prompt. */
export const getAllServices = cache(async (): Promise<Service[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('sort_order')

  if (error) throw error
  return data ?? []
})

/** Featured services only (homepage preview cards). */
export const getFeaturedServices = cache(async (): Promise<Service[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_featured', true)
    .order('sort_order')
    .limit(3)

  if (error) throw error
  return data ?? []
})

/** Services by category (services page tabs). */
export const getServicesByCategory = cache(
  async (category: ServiceCategory): Promise<Service[]> => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('category', category)
      .order('sort_order')

    if (error) throw error
    return data ?? []
  }
)

/** Single service by slug (booking pre-fill, chat tool). */
export const getServiceBySlug = cache(
  async (slug: string): Promise<Service | null> => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) return null
    return data
  }
)

// ── Hairstyles ─────────────────────────────────────────────────

/**
 * Hairstyles for a given face shape — main recommendation query.
 * The face_shapes column is a Postgres `face_shape[]` array.
 * `@>` = "contains" operator — returns hairstyles where the array includes the shape.
 */
export const getHairstylesByFaceShape = cache(
  async (shape: FaceShape): Promise<Hairstyle[]> => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('hairstyles')
      .select('*, service:services(id,name,slug,category,duration_min,price_from,price_to,is_featured)')
      .contains('face_shapes', [shape])
      .order('is_featured', { ascending: false })
      .order('sort_order')

    if (error) throw error
    return data ?? []
  }
)

/** Featured hairstyles (lookbook preview, homepage). */
export const getFeaturedHairstyles = cache(async (): Promise<Hairstyle[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('hairstyles')
    .select('*')
    .eq('is_featured', true)
    .order('sort_order')
    .limit(9)

  if (error) throw error
  return data ?? []
})

/** All hairstyles for the lookbook, optionally filtered by tag. */
export const getLookbookHairstyles = cache(
  async (tag?: string): Promise<Hairstyle[]> => {
    const supabase = await createClient()
    let query = supabase
      .from('hairstyles')
      .select('*')
      .order('sort_order')

    if (tag) {
      query = query.contains('tags', [tag])
    }

    const { data, error } = await query
    if (error) throw error
    return data ?? []
  }
)

// ── Testimonials ───────────────────────────────────────────────

/** Published testimonials for homepage carousel. */
export const getPublishedTestimonials = cache(async (): Promise<Testimonial[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_published', true)
    .order('sort_order')

  if (error) throw error
  return data ?? []
})

/** Aggregate rating stats from published testimonials. */
export const getTestimonialStats = cache(async () => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('testimonials')
    .select('rating')
    .eq('is_published', true)

  if (error) throw error

  const ratings = (data ?? []).map((t: { rating: number }) => t.rating)
  const count   = ratings.length
  const average = count
    ? ratings.reduce((sum: number, r: number) => sum + r, 0) / count
    : 0

  return {
    count,
    average: Math.round(average * 10) / 10,
    fiveStarPercent: count
      ? Math.round((ratings.filter((r: number) => r === 5).length / count) * 100)
      : 0,
  }
})

// ── FAQ ────────────────────────────────────────────────────────

/** All FAQ items (used to build the system prompt + FAQ accordion). */
export const getAllFaq = cache(async (): Promise<FaqItem[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('faq')
    .select('*')
    .order('category')
    .order('sort_order')

  if (error) throw error
  return data ?? []
})

/** FAQ items by category. */
export const getFaqByCategory = cache(
  async (category: FaqCategory): Promise<FaqItem[]> => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('faq')
      .select('*')
      .eq('category', category)
      .order('sort_order')

    if (error) throw error
    return data ?? []
  }
)

// ── Calendar availability ──────────────────────────────────────

/**
 * Returns availability summary for each day in a month.
 * Used by the booking calendar to shade days green/amber/red.
 *
 * This is a client-accessible query (called from the booking page).
 */
export async function getMonthAvailability(
  year: number,
  month: number,  // 1-based
  serviceId: string
): Promise<DayAvailability[]> {
  const supabase = await createClient()

  // Generate all working days in the month
  const firstDay = new Date(year, month - 1, 1)
  const lastDay  = new Date(year, month, 0)
  const results: DayAvailability[] = []

  // Fetch all existing appointments for the month in one query
  const monthStart = firstDay.toISOString().split('T')[0]
  const monthEnd   = lastDay.toISOString().split('T')[0]

  const { data: bookedData } = await supabase
    .from('appointments')
    .select('date, time_slot')
    .gte('date', monthStart)
    .lte('date', monthEnd)
    .in('status', ['pending', 'confirmed'])

  // Group booked slots by date
  const bookedByDate: Record<string, number> = {}
  for (const row of bookedData ?? []) {
    bookedByDate[row.date] = (bookedByDate[row.date] ?? 0) + 1
  }

  // Get service duration + salon config to calculate total slots
  const { data: service } = await supabase
    .from('services')
    .select('duration_min')
    .eq('id', serviceId)
    .single()

  const { data: config } = await supabase
    .from('salon_config')
    .select('hours_open, hours_close, buffer_min, working_days')
    .single()

  if (!service || !config) return results

  const salonOpenMinutes  = timeToMinutes(config.hours_open)
  const salonCloseMinutes = timeToMinutes(config.hours_close)
  const slotDuration      = service.duration_min + config.buffer_min
  const totalSlotsPerDay  = Math.floor(
    (salonCloseMinutes - salonOpenMinutes) / slotDuration
  )

  // Build day summaries
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    const dateStr    = d.toISOString().split('T')[0]
    const dayOfWeek  = d.getDay()
    const isWorkDay  = (config.working_days as number[]).includes(dayOfWeek)
    const isPast     = d < new Date(new Date().toDateString())
    const booked     = bookedByDate[dateStr] ?? 0
    const freeSlots  = Math.max(0, totalSlotsPerDay - booked)

    results.push({
      date:         dateStr,
      total_slots:  isWorkDay && !isPast ? totalSlotsPerDay : 0,
      booked_slots: booked,
      is_available: isWorkDay && !isPast && freeSlots > 0,
    })
  }

  return results
}

// ── Helpers ────────────────────────────────────────────────────

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}
